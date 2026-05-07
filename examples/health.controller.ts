export class HealthController {
    basePath = '/health';

    /**
     * @Get('/')
     */
    async check() {
        return {
            status: 'UP',
            uptime: process.uptime()
        };
    }
}
