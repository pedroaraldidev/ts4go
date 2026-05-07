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
    console.log(`[Parser] Reading project files...`);
    const project = new Project();
    
    // Add the specific file and all files in its parent 'src' directory (if it exists)
    project.addSourceFileAtPath(file);
    
    let srcDir = path.dirname(file);
    while (srcDir.length > 3 && path.basename(srcDir) !== 'src') {
        srcDir = path.dirname(srcDir);
    }
    
    if (path.basename(srcDir) === 'src') {
        project.addSourceFilesAtPaths(path.join(srcDir, '**/*.ts'));
    }

    const sourceFiles = project.getSourceFiles();
    console.log(`[Transform] Converting ${sourceFiles.length} files to IR...`);
    const transformer = new TSTransformer();
    const ir = transformer.transform(sourceFiles);

    console.log(`[Generator] Generating Go project...`);
    const generator = new GoGenerator();
    const files = generator.generate(ir);

    const outDir = path.resolve(options.output);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    
    for (const [filename, content] of files.entries()) {
        const filePath = path.join(outDir, filename);
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
        fs.writeFileSync(filePath, content);
        console.log(`  -> Created ${filename}`);
    }

    const outPath = path.join(outDir, 'cmd', 'main.go');

    console.log(`[Formatter] Formatting with gofmt...`);
    try {
        const { execSync } = require('child_process');
        const goBinDir = 'C:\\Program Files\\Go\\bin';
        execSync(`"${path.join(goBinDir, 'gofmt.exe')}" -w ${outPath}`);
        
        console.log(`[Go] Initializing module and tidying...`);
        const goBin = path.join(goBinDir, 'go.exe');
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
