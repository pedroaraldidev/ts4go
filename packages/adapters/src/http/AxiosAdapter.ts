import { CallExpression, SyntaxKind, Node } from 'ts-morph';
import { IRHttpCall } from '../../ir/src';
import { IAdapter } from '../../shared/src';

export class AxiosAdapter implements IAdapter<CallExpression, IRHttpCall> {
    name = 'Axios';

    canHandle(node: Node): boolean {
        if (node.getKind() !== SyntaxKind.CallExpression) return false;
        const call = node.asKind(SyntaxKind.CallExpression)!;
        const expression = call.getExpression();
        
        if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
            const propAccess = expression.asKind(SyntaxKind.PropertyAccessExpression)!;
            const caller = propAccess.getExpression().getText();
            return caller === 'axios' || caller.includes('axios');
        }
        return false;
    }

    transform(node: CallExpression): IRHttpCall {
        const propAccess = node.getExpression().asKindOrThrow(SyntaxKind.PropertyAccessExpression);
        const method = propAccess.getName().toUpperCase();
        const args = node.getArguments();
        const url = args[0]?.getText().replace(/['"]/g, '') || '';
        const dataVar = args[1]?.getText();

        return {
            kind: 'HttpCall',
            method,
            url,
            dataVar
        };
    }
}
