import { Node } from 'ts-morph';
import { IRNode } from '../../ir/src';

export interface IAdapter<T = Node, R = IRNode> {
    name: string;
    canHandle(node: T): boolean;
    transform(node: T): R;
}

export class AdapterRegistry {
    private static statementAdapters: IAdapter[] = [];
    private static controllerAdapters: IAdapter[] = [];

    static registerStatementAdapter(adapter: IAdapter) {
        this.statementAdapters.push(adapter);
    }

    static registerControllerAdapter(adapter: IAdapter) {
        this.controllerAdapters.push(adapter);
    }

    static tryTransformStatement(node: Node): IRNode | null {
        for (const adapter of this.statementAdapters) {
            if (adapter.canHandle(node)) {
                return adapter.transform(node);
            }
        }
        return null;
    }

    static getControllerAdapter(node: Node): IAdapter | null {
        for (const adapter of this.controllerAdapters) {
            if (adapter.canHandle(node)) {
                return adapter;
            }
        }
        return null;
    }
}
