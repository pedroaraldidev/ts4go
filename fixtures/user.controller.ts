export interface User {
    id: number;
    name: string;
}

export class UserController {
    basePath = '/api';

    /**
     * @Get('/users')
     */
    async list() {
        return [];
    }

    /**
     * @Post('/users')
     */
    async create(user: User) {
        return user;
    }
}
