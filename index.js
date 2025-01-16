'use strict';

import SVGSpriter from 'svg-sprite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_SVG_DIR = path.join(__dirname, 'node_modules/@material-design-icons/svg/');  

const TYPES = [
    'filled',
    'outlined',
    'round',
    'sharp',
    'two-tone'
];

TYPES.forEach(async function(type) {  
    const config = {
        "svg": {
            "xmlDeclaration": false,
            "doctypeDeclaration": false,
            "namespaceIDs": false,
            "namespaceClassnames": false
        },
        "mode": {
            "symbol": {
                "dest": ".",
                "sprite": "mdi-" + type + ".svg"
            }
        }
    };

    const spriter = new SVGSpriter(config);
    const typePath = path.join(ROOT_SVG_DIR, type);
    
    try {
        const files = fs.readdirSync(typePath);

        // Register SVG files with the spriter
        files.forEach(function(file) {
            const filePath = path.join(typePath, file);
            spriter.add(
                path.resolve(filePath),
                file,
                fs.readFileSync(filePath, { encoding: 'utf-8' })
            );
        });

        // Compile the sprites
        spriter.compile(function(error, result) {
            if (error) {
                console.error(`Error processing ${type}:`, error);
                return;
            }
            
            // Run through all configured output modes
            for (const mode in result) {
                // Run through all created resources and write them to disk
                for (const resourceType in result[mode]) {
                    const resource = result[mode][resourceType];
                    fs.mkdirSync(path.dirname(resource.path), { recursive: true });
                    fs.writeFileSync(resource.path, resource.contents);
                    cleanupSprite(resource.path);
                    console.log(`Generated sprite: ${resource.path}`);
                }
            }
        });
    } catch (err) {
        console.error(`Error processing directory ${typePath}:`, err);
    }
});

function cleanupSprite(spriteFile) {
    const fileContent = fs.readFileSync(spriteFile, 'utf8');

    const result = fileContent.replaceAll(' xmlns="http://www.w3.org/2000/svg"', '')
        .replaceAll(' xmlns:xlink="http://www.w3.org/1999/xlink"', '')
        .replace('<svg>', '<svg xmlns="http://www.w3.org/2000/svg">');
    
    fs.writeFileSync(spriteFile, result, 'utf8');
}
