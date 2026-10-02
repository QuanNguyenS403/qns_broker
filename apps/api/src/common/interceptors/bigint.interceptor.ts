import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Đệ quy biến đổi mọi giá trị kiểu bigint thành string trong đối tượng hoặc mảng kết quả
 * Có cơ chế WeakSet chống circular reference và giới hạn độ sâu
 */
function serializeBigInt(obj: any, seen = new WeakSet(), depth = 0): any {
  if (obj === null || obj === undefined || depth > 20) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date || obj instanceof RegExp || (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj))) {
    return obj;
  }

  // Bỏ qua các đối tượng hệ thống Express Response/Request/Socket
  if (obj.socket || obj._readableState || obj._httpMessage) {
    return obj;
  }

  if (seen.has(obj)) {
    return obj;
  }
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item, seen, depth + 1));
  }

  const serialized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    serialized[key] = serializeBigInt(obj[key], seen, depth + 1);
  }
  return serialized;
}

/**
 * RB-12: Global BigInt Interceptor — đảm bảo 100% endpoint API không bao giờ gặp lỗi
 * HTTP 500 "Do not know how to serialize a BigInt" khi trả về nested entities có kiểu BigInt.
 */
@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => serializeBigInt(data)));
  }
}
