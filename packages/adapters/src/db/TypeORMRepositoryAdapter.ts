import { CallExpression, SyntaxKind, Node } from 'ts-morph';
import { IRStatement } from '../../../ir/src';
import { IAdapter } from '../../../shared/src';

export class TypeORMRepositoryAdapter implements IAdapter<CallExpression, IRStatement> {
    name = 'TypeORMRepository';

    canHandle(node: Node): boolean {
        if (!Node.isCallExpression(node)) return false;
        const call = node.asKind(SyntaxKind.CallExpression)!;
        const expr = call.getExpression();
        
        if (Node.isPropertyAccessExpression(expr)) {
            const methodName = expr.getName();
            // Common TypeORM repository methods
            return ['find', 'findOne', 'save', 'delete', 'update'].includes(methodName);
        }
        return false;
    }

    transform(node: CallExpression): IRStatement {
        const expr = node.getExpression().asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        const methodName = expr.getName();
        
        // Map to a generic Statement or specific DB IR node
        // For now, let's treat it as a comment/placeholder for GORM
        return {
            kind: 'HttpCall', // Reusing HttpCall for simplicity in this PoC turn, but should be IRDbCall
            method: 'DB_' + methodName.toUpperCase(),
            url: 'repository_call', // placeholder
        } as any;
    }
}
