// import axios from 'axios';

export class ProxyController {
    basePath = '/proxy';

    /**
     * @Get('/external')
     */
    async getExternalData() {
        const response = await axios.get('https://api.example.com/data');
        return response.data;
    }

    /**
     * @Post('/echo')
     */
    async echoData(body: any) {
        const response = await axios.post('https://postman-echo.com/post', body);
        return response.data;
    }
}
