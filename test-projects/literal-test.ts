
export class TestController {
    basePath = '/test';

    /**
     * @Get('/')
     */
    index() {
        return { 
            message: "hello world",
            success: true,
            count: 42
        };
    }
}
