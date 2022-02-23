
import path    from 'path';
import url     from 'url';
import esbuild from 'esbuild';



const FILE = url.fileURLToPath(import.meta.url);
const ROOT = path.dirname(path.resolve(FILE));


esbuild.buildSync({
	entryPoints: [ ROOT + '/defiant/content/block.mjs' ],
	bundle:      true,
	outfile:     ROOT + '/defiant/content/block.min.js'
});

esbuild.buildSync({
	entryPoints: [ ROOT + '/defiant/content/clean.mjs' ],
	bundle:      true,
	outfile:     ROOT + '/defiant/content/clean.min.js'
});

