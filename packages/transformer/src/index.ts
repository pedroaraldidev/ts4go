import { SourceFile, Node, ClassDeclaration, MethodDeclaration, InterfaceDeclaration, ParameterDeclaration, SyntaxKind } from 'ts-morph';
import { IRProject, IRController, IRRoute, IRDTO, IRParameter, IRType, IRStatement } from '../../ir/src';
import { AdapterRegistry } from '../../shared/src';

export class TSTransformer {
    transform(sourceFile: SourceFile): IRProject {
        const project: IRProject = {
            kind: 'Project',
            controllers: [],
            dtos: []
        };

        const dtoVisitor = new DTOVisitor();
        sourceFile.getInterfaces().forEach(intf => {
            project.dtos.push(dtoVisitor.visit(intf));
        });

        const controllerVisitor = new ControllerVisitor();
        sourceFile.getClasses().forEach(cls => {
            const controller = controllerVisitor.visit(cls);
            if (controller) project.controllers.push(controller);
        });

        // Functional Routes (Express-style) - Only scan top-level statements
        const functionalRoutes: IRRoute[] = [];
        sourceFile.getStatements().forEach(stmt => {
            if (Node.isExpressionStatement(stmt)) {
                const irNode = AdapterRegistry.tryTransformStatement(stmt.getExpression());
                if (irNode && irNode.kind === 'Route') {
                    functionalRoutes.push(irNode as IRRoute);
                }
            }
        });

        if (functionalRoutes.length > 0) {
            project.controllers.push({
                kind: 'Controller',
                name: 'FunctionalApp',
                basePath: '',
                routes: functionalRoutes
            });
        }

        return project;
    }
}

class DTOVisitor {
    visit(node: InterfaceDeclaration): IRDTO {
        return {
            kind: 'DTO',
            name: node.getName(),
            fields: node.getProperties().map(p => ({
                kind: 'Field',
                name: p.getName(),
                type: this.mapType(p.getType().getText())
            }))
        };
    }

    private mapType(text: string): IRType {
        const cleanText = text.trim();
        return {
            kind: 'Type',
            name: cleanText,
            isPrimitive: ['string', 'number', 'boolean'].includes(cleanText),
            isArray: cleanText.includes('[]')
        };
    }
}

class ControllerVisitor {
    visit(node: ClassDeclaration): IRController | null {
        const adapter = AdapterRegistry.getControllerAdapter(node);
        if (!adapter) return null;

        const controller = adapter.transform(node) as IRController;
        const routes: IRRoute[] = [];
        const routeVisitor = new RouteVisitor();

        node.getMethods().forEach(m => {
            const route = routeVisitor.visit(m);
            if (route) routes.push(route);
        });

        controller.routes = routes;
        return controller;
    }
}

class RouteVisitor {
    visit(node: MethodDeclaration): IRRoute | null {
        const jsDocs = node.getJsDocs();
        let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | null = null;
        let path = '';

        jsDocs.forEach(doc => {
            const text = doc.getInnerText();
            const getMatch = text.match(/@Get\(['"](.+?)['"]\)/);
            const postMatch = text.match(/@Post\(['"](.+?)['"]\)/);

            if (getMatch) {
                method = 'GET';
                path = getMatch[1];
            } else if (postMatch) {
                method = 'POST';
                path = postMatch[1];
            }
        });

        if (!method) return null;

        return {
            kind: 'Route',
            method,
            path,
            handlerName: node.getName(),
            parameters: node.getParameters().map(p => this.visitParameter(p, method === 'GET' ? 'query' : 'body')),
            body: this.visitBody(node)
        };
    }

    private visitBody(node: MethodDeclaration): IRStatement[] {
        const statements: IRStatement[] = [];
        
        // Search for all nodes and check for patterns
        node.forEachDescendant(child => {
            // Pattern 1: const x = await axios.get()
            if (child.getKind() === SyntaxKind.VariableDeclaration) {
                const vd = child.asKind(SyntaxKind.VariableDeclaration)!;
                const init = vd.getInitializer();
                if (init) {
                    const call = this.getCallExpression(init);
                    if (call) {
                        const irNode = AdapterRegistry.tryTransformStatement(call);
                        if (irNode && irNode.kind === 'HttpCall') {
                            (irNode as any).resultVar = vd.getName();
                            statements.push(irNode as IRStatement);
                        }
                    }
                }
            }
            // Pattern 2: await axios.post() (no assignment)
            else if (child.getKind() === SyntaxKind.ExpressionStatement) {
                const exprStmt = child.asKind(SyntaxKind.ExpressionStatement)!;
                const call = this.getCallExpression(exprStmt.getExpression());
                if (call) {
                    const irNode = AdapterRegistry.tryTransformStatement(call);
                    if (irNode && irNode.kind === 'HttpCall' && !(irNode as any).resultVar) {
                        statements.push(irNode as IRStatement);
                    }
                }
            }
        });

        return statements;
    }

    private getCallExpression(node: any): any {
        if (node.getKind() === SyntaxKind.CallExpression) return node;
        if (node.getKind() === SyntaxKind.AwaitExpression) {
            const expr = node.asKind(SyntaxKind.AwaitExpression)!.getExpression();
            if (expr.getKind() === SyntaxKind.CallExpression) return expr;
        }
        return null;
    }

    private visitParameter(node: ParameterDeclaration, defaultIn: 'query' | 'body'): IRParameter {
        const type = node.getType();
        const typeName = type.getSymbol()?.getName() || type.getText().split('.').pop() || 'interface{}';
        
        return {
            kind: 'Parameter',
            name: node.getName(),
            type: {
                kind: 'Type',
                name: typeName,
                isPrimitive: ['string', 'number', 'boolean'].includes(typeName),
                isArray: type.isArray()
            },
            in: defaultIn
        };
    }
}
