import { ClassDeclaration, SyntaxKind, Node } from 'ts-morph';
import { IRController } from '../../../ir/src';
import { IAdapter } from '../../../shared/src';

export class DefaultControllerAdapter implements IAdapter<ClassDeclaration, IRController> {
    name = 'DefaultController';

    canHandle(node: Node): boolean {
        if (node.getKind() !== SyntaxKind.ClassDeclaration) return false;
        const cls = node.asKind(SyntaxKind.ClassDeclaration)!;
        return cls.getName()?.endsWith('Controller') || false;
    }

    transform(node: ClassDeclaration): IRController {
        const basePath = node.getProperty('basePath')?.getInitializer()?.getText().replace(/['"]/g, '') || '';
        return {
            kind: 'Controller',
            name: node.getName() || 'Anonymous',
            basePath,
            routes: [] 
        };
    }
}
