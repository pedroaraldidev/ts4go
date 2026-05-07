import { ClassDeclaration, SyntaxKind, Node } from 'ts-morph';
import { IRDTO, IRField } from '../../../ir/src';
import { IAdapter } from '../../../shared/src';

export class TypeORMEntityAdapter implements IAdapter<ClassDeclaration, IRDTO> {
    name = 'TypeORMEntity';

    canHandle(node: Node): boolean {
        if (!Node.isClassDeclaration(node)) return false;
        // Check for @Entity() decorator
        return node.getDecorators().some(d => d.getName() === 'Entity');
    }

    transform(node: ClassDeclaration): IRDTO {
        const fields: IRField[] = [];

        node.getProperties().forEach(prop => {
            const name = prop.getName();
            const type = prop.getType().getText();
            const decorators = prop.getDecorators().map(d => d.getName());

            // Simple type mapping (can be expanded)
            const irType = {
                kind: 'Type' as const,
                name: type === 'number' ? 'int' : 'string',
                isPrimitive: true,
                isArray: false
            };

            // Identify primary key
            const isPrimary = decorators.includes('PrimaryGeneratedColumn') || decorators.includes('PrimaryColumn');

            fields.push({
                kind: 'Field',
                name,
                type: irType
            });
        });

        return {
            kind: 'DTO',
            name: node.getName() || 'Entity',
            fields
        };
    }
}
