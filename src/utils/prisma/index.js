// src/utils/prisma/index.js

import { PrismaClient } from '@prisma/client';
// PrismaClient 인스턴스
export const prisma = new PrismaClient({
  // SQL을 출력
  log: ['query', 'info', 'warn', 'error'],

  // error format 지정
  errorFormat: 'pretty',
});