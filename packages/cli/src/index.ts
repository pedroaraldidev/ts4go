import { Command } from 'commander';
import { Project } from 'ts-morph';
import { TSTransformer } from '../../transformer/src';
import { GoGenerator } from '../../generator-go/src';
import { bootstrapAdapters } from '../../adapters/src';
import fs from 'fs';
import path from 'path';

bootstrapAdapters();

const program = new Command();

program
  .name('ts4go')
  .description('Compiler to convert TS/PHP APIs to Go')
  .version('0.1.0');

program.command('build')
  .argument('<file>', 'Source file to compile')
  .option('-o, --output <dir>', 'Output directory', './output')
  .action((file, options) => {
    console.log(`[Parser] Reading ${file}...`);
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(file);

    console.log(`[Transform] Converting TS AST to IR...`);
    const transformer = new TSTransformer();
    const ir = transformer.transform(sourceFile);

    console.log(`[Generator] Generating Go code...`);
    const generator = new GoGenerator();
    const goCode = generator.generate(ir);

    const outDir = path.resolve(options.output);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    const outPath = path.join(outDir, 'main.go');
    fs.writeFileSync(outPath, goCode);

    console.log(`[Formatter] Formatting with gofmt...`);
    try {
        const { execSync } = require('child_process');
        execSync(`gofmt -w ${outPath}`);
        
        console.log(`[Go] Initializing module and tidying...`);
        const goBin = 'C:\\Program Files\\Go\\bin\\go.exe';
        if (!fs.existsSync(path.join(outDir, 'go.mod'))) {
            execSync(`"${goBin}" mod init ts4go-api`, { cwd: outDir });
        }
        execSync(`"${goBin}" mod tidy`, { cwd: outDir });
    } catch (e) {
        console.warn(`[Warning] Go tooling failed. Make sure Go is installed and in your PATH.`);
    }
    
    console.log(`\n--- Build Success ---`);
    console.log(`Generated: ${outPath}`);
  });

program.parse();
