import { PropertyAccessExpression, SyntaxKind, Node } from 'ts-morph';
import { IREnvVar } from '../../../ir/src';
import { IAdapter } from '../../../shared/src';

export class EnvAdapter implements IAdapter<PropertyAccessExpression, IREnvVar> {
    name = 'Env';

    canHandle(node: Node): boolean {
        if (node.getKind() !== SyntaxKind.PropertyAccessExpression) return false;
        const prop = node.asKind(SyntaxKind.PropertyAccessExpression)!;
        const text = prop.getText();
        return text.startsWith('process.env.');
    }

    transform(node: PropertyAccessExpression): IREnvVar {
        const name = node.getName();
        return {
            kind: 'EnvVar',
            name
        };
    }
}
