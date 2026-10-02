import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateViewingRequestDto } from './dto/create-viewing-request.dto';
import { ConfirmViewingDto } from './dto/confirm-viewing.dto';
import { RescheduleViewingDto } from './dto/reschedule-viewing.dto';
import { CancelViewingDto } from './dto/cancel-viewing.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import * as crypto from 'crypto';

@Injectable()
export class ViewingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kiểm tra quyền truy cập lịch xem phòng (F02)
   * Chỉ cho phép:
   * 1. Quản trị viên (admin)
   * 2. Chuyên viên tư vấn phụ trách (agent.userId)
   * 3. Khách thuê đặt lịch (request.userId hoặc clientPhone)
   * 4. Chủ nhà sở hữu phòng (unit.ownerId)
   */
  private assertViewingAccess(
    viewing: any,
    actor?: { id: bigint; role: string; phone?: string }
  ) {
    if (!actor) {
      throw new ForbiddenException('Yêu cầu xác thực tài khoản để thực hiện thao tác');
    }

    if (actor.role === 'admin') {
      return true;
    }

    const actorId = BigInt(actor.id);

    // 1. Chuyên viên tư vấn được giao
    if (viewing.agent && viewing.agent.userId && BigInt(viewing.agent.userId) === actorId) {
      return true;
    }

    // 2. Khách thuê đặt lịch
    if (viewing.request && viewing.request.userId && BigInt(viewing.request.userId) === actorId) {
      return true;
    }
    if (actor.phone && viewing.clientPhone === actor.phone) {
      return true;
    }

    // 3. Chủ nhà sở hữu phòng
    if (viewing.unit && viewing.unit.ownerId && BigInt(viewing.unit.ownerId) === actorId) {
      return true;
    }

    throw new ForbiddenException('Bạn không có quyền thao tác trên lịch xem phòng này');
  }

  private async getDefaultAgent() {
    let agent = await this.prisma.agentProfile.findFirst({
      where: { isActive: true },
    });

    if (!agent) {
      let quan = await this.prisma.user.findFirst({
        where: { phone: '0981753082' },
      });

      if (!quan) {
        quan = await this.prisma.user.create({
          data: {
            phone: '0981753082',
            fullName: 'Đức Quân',
            role: 'broker',
            isPhoneVerified: true,
          },
        });
      }

      agent = await this.prisma.agentProfile.create({
        data: {
          userId: quan.id,
          displayName: 'Đức Quân',
          workPhone: '0981753082',
          zaloPhone: '0981753082',
          bio: 'Người tư vấn và trực tiếp dẫn xem',
          maxDailyViewings: 3,
          isActive: true,
        },
      });
    }

    return agent;
  }

  /**
   * Tạo yêu cầu lịch xem phòng (Khách yêu cầu, chưa được xác nhận)
   */
  async requestViewing(dto: CreateViewingRequestDto) {
    const unitIdBigInt = BigInt(dto.unitId);

    const unit = await this.prisma.rentalUnit.findUnique({
      where: { id: unitIdBigInt },
    });

    if (!unit) {
      throw new NotFoundException('Không tìm thấy phòng cho thuê yêu cầu');
    }

    if (unit.status === 'unavailable' || unit.status === 'rented') {
      throw new BadRequestException('Phòng hiện không khả dụng để đặt lịch xem');
    }

    const start = new Date(dto.scheduledStartTime);
    const end = new Date(dto.scheduledEndTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Thời gian hẹn không hợp lệ');
    }
    if (start >= end) {
      throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
    }
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
      throw new BadRequestException('Không thể đặt lịch xem sang thời gian trong quá khứ');
    }

    const agent = await this.getDefaultAgent();
    const viewingCode = `VW-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    return this.prisma.viewing.create({
      data: {
        viewingCode,
        unitId: unitIdBigInt,
        agentId: agent.id,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        scheduledStartTime: start,
        scheduledEndTime: end,
        status: 'requested',
        notes: dto.notes,
      },
    });
  }

  /**
   * Xác nhận lịch xem phòng (Chống trùng giờ dẫn của Agent - AT-10)
   */
  async confirmViewing(id: bigint | number | string, dto: ConfirmViewingDto = {}) {
    const viewingId = BigInt(id);

    return this.prisma.$transaction(async (tx) => {
      const viewing = await tx.viewing.findUnique({
        where: { id: viewingId },
        include: { unit: true },
      });

      if (!viewing) {
        throw new NotFoundException('Không tìm thấy lịch xem phòng');
      }

      if (viewing.status === 'cancelled') {
        throw new BadRequestException('Không thể xác nhận lịch đã bị hủy');
      }

      const agentId = dto.agentId ? BigInt(dto.agentId) : viewing.agentId;
      const agent = await tx.agentProfile.findUnique({
        where: { id: agentId },
      });

      if (!agent || !agent.isActive) {
        throw new BadRequestException('Chuyên viên tư vấn không khả dụng');
      }

      // Kiểm tra phòng
      if (viewing.unit.status === 'unavailable') {
        throw new BadRequestException('Phòng này hiện đã hết hoặc ngừng cho thuê');
      }

      // AT-10: Kiểm tra trùng giờ của agent dẫn xem
      // Hai lịch xung đột khi: existing.start < new.end && existing.end > new.start
      const conflictingViewing = await tx.viewing.findFirst({
        where: {
          id: { not: viewing.id },
          agentId,
          status: 'confirmed',
          scheduledStartTime: { lt: viewing.scheduledEndTime },
          scheduledEndTime: { gt: viewing.scheduledStartTime },
        },
      });

      if (conflictingViewing) {
        throw new ConflictException(
          'Thời gian dẫn khách bị trùng với một lịch hẹn khác của chuyên viên tư vấn'
        );
      }

      // Kiểm tra giới hạn số lịch xem trong ngày (maxDailyViewings)
      const startOfDay = new Date(viewing.scheduledStartTime);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(viewing.scheduledStartTime);
      endOfDay.setHours(23, 59, 59, 999);

      const confirmedTodayCount = await tx.viewing.count({
        where: {
          id: { not: viewing.id },
          agentId,
          status: 'confirmed',
          scheduledStartTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      if (confirmedTodayCount >= agent.maxDailyViewings) {
        throw new ConflictException(
          `Đã đạt giới hạn tối đa ${agent.maxDailyViewings} lịch dẫn xem trong ngày của chuyên viên`
        );
      }

      const checkinCode =
        dto.checkinCode || crypto.randomInt(100000, 999999).toString();

      return tx.viewing.update({
        where: { id: viewingId },
        data: {
          agentId,
          status: 'confirmed',
          checkinCode,
          notes: dto.notes
            ? `${viewing.notes ? viewing.notes + '\n' : ''}${dto.notes}`
            : viewing.notes,
        },
      });
    });
  }

  /**
   * Đổi giờ lịch xem phòng (AT-12, F02, F36, F37)
   */
  async rescheduleViewing(
    id: bigint | number | string,
    dto: RescheduleViewingDto,
    actor?: { id: bigint; role: string; phone?: string }
  ) {
    const viewingId = BigInt(id);
    const newStart = new Date(dto.newStartTime);
    const newEnd = new Date(dto.newEndTime);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      throw new BadRequestException('Thời gian hẹn mới không hợp lệ');
    }
    if (newStart >= newEnd) {
      throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
    }
    if (newStart.getTime() < Date.now() - 5 * 60 * 1000) {
      throw new BadRequestException('Không thể chuyển lịch xem sang thời gian trong quá khứ');
    }

    return this.prisma.$transaction(async (tx) => {
      const viewing = await tx.viewing.findUnique({
        where: { id: viewingId },
        include: {
          unit: true,
          agent: true,
          request: true,
        },
      });

      if (!viewing) {
        throw new NotFoundException('Không tìm thấy lịch xem phòng');
      }

      this.assertViewingAccess(viewing, actor);

      if (viewing.status === 'cancelled') {
        throw new BadRequestException('Không thể đổi lịch của một cuộc hẹn đã bị hủy');
      }

      // Nếu viewing đang confirmed, kiểm tra xem khung giờ mới có bị trùng không
      if (viewing.status === 'confirmed') {
        const conflict = await tx.viewing.findFirst({
          where: {
            id: { not: viewing.id },
            agentId: viewing.agentId,
            status: 'confirmed',
            scheduledStartTime: { lt: newEnd },
            scheduledEndTime: { gt: newStart },
          },
        });

        if (conflict) {
          throw new ConflictException(
            'Khung giờ mới bị trùng với một lịch hẹn khác của chuyên viên tư vấn'
          );
        }

        // F37: Kiểm tra maxDailyViewings của ngày mới
        const agent = await tx.agentProfile.findUnique({
          where: { id: viewing.agentId },
        });

        if (agent) {
          const startOfDay = new Date(newStart);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(newStart);
          endOfDay.setHours(23, 59, 59, 999);

          const confirmedCount = await tx.viewing.count({
            where: {
              id: { not: viewing.id },
              agentId: viewing.agentId,
              status: 'confirmed',
              scheduledStartTime: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });

          if (confirmedCount >= agent.maxDailyViewings) {
            throw new ConflictException(
              `Đã đạt giới hạn tối đa ${agent.maxDailyViewings} lịch dẫn xem trong ngày mới của chuyên viên`
            );
          }
        }
      }

      const historyEntry = `[Đổi lịch từ ${viewing.scheduledStartTime.toISOString()} sang ${newStart.toISOString()} lúc ${new Date().toISOString()}]: ${dto.reason || 'Khách/Agent yêu cầu đổi giờ'}`;

      const updated = await tx.viewing.update({
        where: { id: viewingId },
        data: {
          scheduledStartTime: newStart,
          scheduledEndTime: newEnd,
          status: 'rescheduled',
          notes: viewing.notes ? `${viewing.notes}\n${historyEntry}` : historyEntry,
        },
      });

      await tx.auditEvent.create({
        data: {
          actorId: actor?.id ? BigInt(actor.id) : null,
          action: 'viewing.rescheduled',
          entityType: 'viewing',
          entityId: viewingId.toString(),
          reason: dto.reason || 'Đổi giờ lịch xem phòng',
          afterState: {
            newStart: newStart.toISOString(),
            newEnd: newEnd.toISOString(),
          },
        },
      });

      return updated;
    });
  }

  /**
   * Hủy lịch xem phòng (AT-12, F02)
   */
  async cancelViewing(
    id: bigint | number | string,
    dto: CancelViewingDto = {},
    actor?: { id: bigint; role: string; phone?: string }
  ) {
    const viewingId = BigInt(id);

    const viewing = await this.prisma.viewing.findUnique({
      where: { id: viewingId },
      include: {
        unit: true,
        agent: true,
        request: true,
      },
    });

    if (!viewing) {
      throw new NotFoundException('Không tìm thấy lịch xem phòng');
    }

    this.assertViewingAccess(viewing, actor);

    const historyEntry = `[Đã hủy lúc ${new Date().toISOString()}]: ${dto.reason || 'Khách/Chủ hủy cuộc hẹn'}`;

    const updated = await this.prisma.viewing.update({
      where: { id: viewingId },
      data: {
        status: 'cancelled',
        notes: viewing.notes ? `${viewing.notes}\n${historyEntry}` : historyEntry,
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        actorId: actor?.id ? BigInt(actor.id) : null,
        action: 'viewing.cancelled',
        entityType: 'viewing',
        entityId: viewingId.toString(),
        reason: dto.reason || 'Hủy lịch xem phòng',
      },
    });

    return updated;
  }

  /**
   * Hoàn tất buổi xem phòng
   */
  async completeViewing(id: bigint | number | string, feedback?: string) {
    const viewingId = BigInt(id);

    return this.prisma.viewing.update({
      where: { id: viewingId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        clientFeedback: feedback,
      },
    });
  }

  /**
   * Giữ phòng (UnitReservation) — Chống giữ/cho thuê trùng phòng (AT-11)
   */
  async reserveUnit(dto: CreateReservationDto) {
    const unitId = BigInt(dto.unitId);
    const dealId = dto.dealId ? BigInt(dto.dealId) : null;
    const reservedFrom = new Date(dto.reservedFrom);
    const reservedUntil = new Date(dto.reservedUntil);

    if (reservedFrom >= reservedUntil) {
      throw new BadRequestException('Thời gian bắt đầu giữ phải trước thời gian kết thúc');
    }

    return this.prisma.$transaction(async (tx) => {
      const unit = await tx.rentalUnit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        throw new NotFoundException('Không tìm thấy phòng cho thuê');
      }

      if (unit.status === 'unavailable' || unit.status === 'rented') {
        throw new ConflictException('Phòng hiện không khả dụng để giữ chỗ hoặc thuê');
      }

      // AT-11: Kiểm tra khoảng thời gian trùng lặp với các reservation đang active
      // Trùng khi: existing.reservedFrom < new.reservedUntil && existing.reservedUntil > new.reservedFrom
      const conflictingReservation = await tx.unitReservation.findFirst({
        where: {
          unitId,
          status: 'active',
          reservedFrom: { lt: reservedUntil },
          reservedUntil: { gt: reservedFrom },
        },
      });

      if (conflictingReservation) {
        throw new ConflictException(
          'Phòng đã có người giữ chỗ trong khoảng thời gian này'
        );
      }

      return tx.unitReservation.create({
        data: {
          unitId,
          dealId,
          reservedFrom,
          reservedUntil,
          holdReason: dto.holdReason || 'viewing_interest',
          status: 'active',
        },
      });
    });
  }

  /**
   * Hủy giữ chỗ phòng
   */
  async cancelReservation(id: bigint | number | string) {
    const resId = BigInt(id);

    return this.prisma.unitReservation.update({
      where: { id: resId },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Xử lý khi phòng hết/ngừng cho thuê (AT-12)
   */
  async handleUnitUnavailable(unitId: bigint | number | string, reason = 'Phòng đã cho thuê') {
    const uId = BigInt(unitId);

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật phòng
      await tx.rentalUnit.update({
        where: { id: uId },
        data: { status: 'unavailable' },
      });

      // 2. Tìm các lịch xem đang requested hoặc confirmed
      const upcomingViewings = await tx.viewing.findMany({
        where: {
          unitId: uId,
          status: { in: ['requested', 'confirmed'] },
        },
      });

      // 3. Hủy hoặc cập nhật ghi chú cảnh báo cho các lịch này
      for (const v of upcomingViewings) {
        await tx.viewing.update({
          where: { id: v.id },
          data: {
            status: 'cancelled',
            notes: `${v.notes ? v.notes + '\n' : ''}[Tự động hủy do phòng hết chỗ lúc ${new Date().toISOString()}]: ${reason}`,
          },
        });
      }

      return { affectedViewings: upcomingViewings.length };
    });
  }

  /**
   * Lấy danh sách lịch xem
   */
  async getViewings(filters: { agentId?: bigint; unitId?: bigint; status?: string }) {
    return this.prisma.viewing.findMany({
      where: {
        agentId: filters.agentId,
        unitId: filters.unitId,
        status: filters.status,
      },
      include: {
        unit: true,
        agent: true,
      },
      orderBy: { scheduledStartTime: 'asc' },
    });
  }
}
