import parser from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs'
import path from 'path'

// TODO: add types for everything

const dependencyGraph: any = {};

function createAst(fileName: string): any {

	const content = fs.readFileSync(fileName, 'utf8');
	const ast = parser.parse(content, {
		sourceType: 'module',
	});

	const dependencies: string[] = [];

	traverse(ast, {
		enter(path: any) {
			if (path.node.type === "ImportDeclaration") {
				const importDependency = path.node.source.value;
				dependencies.push(importDependency);
			}
		}
	});

	dependencyGraph[fileName] = dependencies;
	dependencies.forEach(dependency => {
		const resolvedPath = path.resolve(path.dirname(fileName), dependency)
		const relativePath = './' + path.relative(process.cwd(), resolvedPath);
		createAst(relativePath)
	}
	)
};

const mainFile = "./test/try.js";
createAst(mainFile);
console.log(dependencyGraph);
