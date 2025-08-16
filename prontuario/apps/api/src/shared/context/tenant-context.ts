import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage<{ userId: string }>();

export const TenantContext = {
  run<T>(userId: string, fn: () => T): T {
    return als.run({ userId }, fn);
  },
  
  getUserId(): string | undefined {
    return als.getStore()?.userId;
  },
  
  getStore() {
    return als.getStore();
  }
};
