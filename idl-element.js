/**
* construct a data-island Custom Element for a given idl fragment
*/
function IdlElementFactory({ idl, optionalInterfaceName}){
	// preliminary input validation
	if( !idl){
		throw new Error("No idl provided")
	}
	if( typeof( idl)=== "string"){
		throw new Error("Expected a parsed IDL")
	}

	// find target interface
	var iface
	for( var i= 0; i< idl.length; ++i){
		var current= idl[ i]
		if( current.type!== "interface"){
			continue
		}
		if( !optionalInterfaceName|| current.name=== optionalInterface){
			iface= current
			break
		}
	}
	if( !iface){
		throw new Error("Did not find interface")
	}

	// parse 
	var
	  props= {},
	  staticProps= {}
	iface.members.forEach( member=>{
		var _name= '_'+ member.name
		if( member.type=== "attribute"){
			props[ member.name]= {
				get: function(){ return this[ _name]},
				set: function( val){ this[_name]= val},
				configurable: true
			}
		}else if( member.type=== "const"){
			staticProps[ member.name]= {
				get: function(){ return this[ _name]},
				configurable: true
			}
		}
	})

	// construct bare HTMLElement
	var idlElement= class extends HTMLElement {
		constructor(){
			super()
		}
	}

	// attach generated properties
	var observedAttributes= Object.keys( props)
	staticProps.observedAttributes= {
		value: observedAttributes,
		configurable: true
	}
	Object.defineProperties(idlElement.prototype, props)
	Object.defineProperties(idlElement, staticProps)
	return idlElement
}
