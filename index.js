'use strict';

const SVGSpriter    = require('svg-sprite'),
path                = require('path'),
mkdirp              = require('mkdirp'),
fs                  = require('fs');

const ROOT_SVG_DIR = __dirname + '/node_modules/@material-design-icons/svg/';

const TYPES = [
    'filled',
    'outlined',
    'round',
    'sharp',
    'two-tone'
];


TYPES.forEach(function(type){
    var config = {
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

    
    var spriter = new SVGSpriter(config);

    var files = fs.readdirSync(ROOT_SVG_DIR + type);

    // Register SVG files with the spriter
    files.forEach(function(file){
        spriter.add(
            path.resolve(ROOT_SVG_DIR + type + '/' + file),
            file,
            fs.readFileSync(path.resolve(ROOT_SVG_DIR + type + '/' + file), { encoding: 'utf-8' })
        );
    })

    // Compile the sprites
    spriter.compile(function(error, result) {
        // Run through all configured output modes
        for (var mode in result) {
            // Run through all created resources and write them to disk
            for (var type in result[mode]) {
                mkdirp.sync(path.dirname(result[mode][type].path));
                fs.writeFileSync(result[mode][type].path, result[mode][type].contents);
                cleanupSprite(result[mode][type].path);
            }
        }
    });

});



function cleanupSprite (spriteFile)
{
    var fileContent = fs.readFileSync(spriteFile, 'utf8');

    var result = fileContent.replaceAll(' xmlns="http://www.w3.org/2000/svg"', '')
                            .replaceAll(' xmlns:xlink="http://www.w3.org/1999/xlink"', '')
                            .replace('<svg>', '<svg xmlns="http://www.w3.org/2000/svg">');
    
    fs.writeFileSync(spriteFile, result, 'utf8');
}
