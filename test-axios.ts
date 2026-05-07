import { Project } from 'ts-morph';
import { AxiosAdapter } from './packages/adapters/src/AxiosAdapter';

const project = new Project();
const sourceFile = project.createSourceFile('test.ts', `
    import axios from 'axios';
    class Test {
        async run() {
            await axios.get('https://google.com');
        }
    }
`);

const call = sourceFile.getDescendantsOfKind(210 /* CallExpression */)[0];
console.log('Is Axios Call:', AxiosAdapter.isAxiosCall(call));
console.log('IR:', AxiosAdapter.transform(call));
