import { IResponse } from '../interfaces/response.net';

export class APIResponse {
  static successResponse(data: { message: string; data?: any }) {
    return {
      message: data.message,
      data: data?.data !== undefined ? data.data : {},
      code: '0',
      status: 'success',
    };
  }

  static errorResponse(data: { code: number; message: string; data?: any }) {
    return {
      message: data.message,
      data: data?.data !== undefined ? data.data : {},
      code: data.code,
      status: 'failed',
    };
  }

  static getResponse<T>(data: T): IResponse<T> {
    return { data };
  }

  static getPagination<T, R>(result: T[], total: number): IResponse<R> {
    const data: unknown = { result, total };
    return { data } as IResponse<R>;
  }
}
