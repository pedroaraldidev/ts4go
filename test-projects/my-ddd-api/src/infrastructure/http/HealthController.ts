import { CheckHealthUseCase } from '../../application/CheckHealthUseCase';

export class HealthController {
    basePath = '/health';

    /**
     * @Get('/')
     */
    check() {
        const useCase = new CheckHealthUseCase();
        return useCase.execute();
    }
}
