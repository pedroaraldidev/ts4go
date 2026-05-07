import { ClassDeclaration, SyntaxKind, Node } from 'ts-morph';
import { IRController, IRRoute } from '../../ir/src';
import { IAdapter } from '../../../shared/src';

export class VanillaHttpAdapter implements IAdapter<ClassDeclaration, IRController> {
    name = 'VanillaHttp';

    canHandle(node: Node): boolean {
        if (!Node.isClassDeclaration(node)) return false;
        // Identifies a class pattern with run() method and res property
        const hasRun = !!node.getMethod('run');
        const hasRes = !!node.getProperty('res');
        return hasRun && hasRes;
    }

    transform(node: ClassDeclaration): IRController {
        const routes: IRRoute[] = [];
        const runMethod = node.getMethodOrThrow('run');

        // Scan for IfStatements that look like route definitions
        runMethod.getDescendantsOfKind(SyntaxKind.IfStatement).forEach(ifStmt => {
            const condition = ifStmt.getExpression().getText();
            
            // Simple pattern matching for vanilla routing
            const pathMatch = condition.match(/this\.uri\s*===\s*['"](.+?)['"]/);
            const methodMatch = condition.match(/this\.method\s*===\s*['"](.+?)['"]/);

            if (pathMatch && methodMatch) {
                const method = methodMatch[1].toUpperCase() as any;
                const path = pathMatch[1];

                routes.push({
                    kind: 'Route',
                    method,
                    path,
                    handlerName: `Handle_${method}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`,
                    parameters: [],
                    body: [] 
                });
            }
        });

        return {
            kind: 'Controller',
            name: node.getName() || 'VanillaApp',
            basePath: '',
            routes
        };
    }
}
