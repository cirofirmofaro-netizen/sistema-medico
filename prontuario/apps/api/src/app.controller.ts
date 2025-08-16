import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  ping() {
    return { ok: true, name: 'Prontuário API', docs: '/docs', time: new Date().toISOString() };
  }
}
