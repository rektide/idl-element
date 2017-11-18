"use module"
"use strict"

import contextRunner from "context-runner"
import ejs from "ejs"
import fs from "mz/fs"
import minimist from "minimist"
import getStdin from "get-stdin"

/**
* Utility method which creates an object `target` from keys from a `stringArray` and values which are the keys, run through `mapper`.
*/
export async function objectMapper( stringArray, target, mapper){
	target= target|| {}
	if( typeof(stringArray)=== "string"){
		stringArray= [ stringArray]
	}
	var all= stringArray.map( async function( str){
		target[ str]= await mapper( str)
	})
	return Promise.all( all).then( _=> target)
}

/**
* Utility method attempting to load the `filename` first as a module, then as pure JSON.
*/
export async function omniImport( filename){
	try{
		var
		  cwdFilename= process.cwd()+ "/"+ filename,
		  imported= await import( cwdFilename)
		return imported.default
	}catch(ex){
		var text= await fs.readFile( filename, "utf8")
		return JSON.parse( text)
	}
}

/**
  Utility method to read the contents of each of `filenames` and merge all the contents
*/
export async function readMerge( filenames){
	var 
	  arrayitized= (typeof( filenames)=== "string"? [ filenames]: filenames)|| [],
	  // import each file's contents
	  jsons= arrayitized.map( omniImport),
	  all= await Promise.all( jsons)
	  // merge all the results together
	all.unshift({})
	var merged= all.length=== 0? {}: Object.assign.apply(Object, all)
	return merged
};

/**
  Utility method to read either - stdin or filename
*/
export function readInput( filename){
	var useStdin= filename=== "-"|| filename=== undefined
	return useStdin? getStdin(): fs.readFile( filename, "utf8")
}

export let alias= { c: "context", o: "options"}
export let argv= ctx=> process.argv.slice( 2)
export let args= ctx=> minimist( ctx.argv, { alias: ctx.alias})
// Context that will be passed to ejs comes from context files
export let context= ctx=> readMerge( ctx.args.context)
export let options= ctx=> readMerge( ctx.args.options)
export let filenames= ctx=> ctx.args._
export let inputs= ctx=> objectMapper( ctx.filenames, {}, readInput)
export function templates( ctx){
	var templates= {}
	for( var inputFilename in ctx.inputs){
		var input= ctx.inputs[ inputFilename]
		// compile the input as ejs
		templates[ inputFilename]= ejs.compile( input, ctx.options)
	}
	return templates
}
export function output( ctx){
	var
	  outputs= [],
	  context= ctx.context|| {}
	for( var inputFilename in ctx.templates){
		var template= ctx.templates[ inputFilename]
		// pass the `input` template a special `__filename` piece of context
		context.__filename= inputFilename
		// evaluate the template
		var output= template( context)
		outputs.push( output)
	}
	var output= outputs.join( "\n")
	return output
}

export let defaults= {
	alias,
	argv,
	args,
	context,
	options,
	filenames,
	inputs,
	templates,
	output
}

var _defaults= defaults

export async function main( ctx, defaults){
	defaults= defaults|| _defaults
	return contextRunner( ctx, defaults)
}

export default main
