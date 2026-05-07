import { CallExpression, SyntaxKind, Node, ArrowFunction, FunctionExpression } from 'ts-morph';
import { IRRoute, IRStatement } from '../../../ir/src';
import { IAdapter, AdapterRegistry } from '../../../shared/src';

export class ExpressAdapter implements IAdapter<CallExpression, IRRoute> {
    name = 'Express';

    canHandle(node: Node): boolean {
        if (node.getKind() !== SyntaxKind.CallExpression) return false;
        const call = node.asKind(SyntaxKind.CallExpression)!;
        const expr = call.getExpression();
        
        if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
            const prop = expr.asKind(SyntaxKind.PropertyAccessExpression)!;
            const methodName = prop.getName().toLowerCase();
            return ['get', 'post', 'put', 'delete'].includes(methodName);
        }
        return false;
    }

    transform(node: CallExpression): IRRoute {
        const prop = node.getExpression().asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        const method = prop.getName().toUpperCase() as any;
        const args = node.getArguments();
        
        const path = args[0]?.getText().replace(/['"]/g, '') || '/';
        const callback = args[1];

        const statements: IRStatement[] = [];
        // Generate a semantic handler name
        const cleanPath = path.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '');
        let handlerName = `Express_${method}_${cleanPath || 'root'}`;

        // Dig into the callback function
        if (callback && (Node.isArrowFunction(callback) || Node.isFunctionExpression(callback))) {
            const func = callback as (ArrowFunction | FunctionExpression);
            
            // Scan the function body for statements that our registry can handle
            func.forEachDescendant(child => {
                const irNode = AdapterRegistry.tryTransformStatement(child);
                if (irNode) {
                    statements.push(irNode as IRStatement);
                }
            });
        }

        return {
            kind: 'Route',
            method,
            path,
            handlerName,
            parameters: [], 
            body: statements
        };
    }
}
