// ------------------------------------------------------------------------------------------------------------------------
//
//  ██  ██  ██   ██ ██
//  ██  ██  ██      ██
//  ██  ██ █████ ██ ██ █████
//  ██  ██  ██   ██ ██ ██
//  ██  ██  ██   ██ ██ █████
//  ██  ██  ██   ██ ██    ██
//  ██████  ████ ██ ██ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Utils - static library of utility functions


	// ---------------------------------------------------------------------------------------------------------------
	// class

		/**
		 * Miscellaneous utility functions
		 */
		Utils =
		{
			/**
			 * Extends an object or array with more properties or elements
			 *
			 * @param	{Object}	obj			A source Object to be extended
			 * @param	{Object}	props		The properties to be added
			 * @returns	{Object}				The modified object
			 *
			 * @param	{Array}		obj			A source Array to be extended
			 * @param	{Array}		props		The elements to be added
			 * @returns	{Array}					The modified array
			 */
			extend:function(obj, props)
			{
				// variables
					var prop;

				// extend array
					if(Utils.isArray(obj) && Utils.isArray(props))
					{
						for(var i = 0; i < props.length; i++)
						{
							obj.push(props[i]);
						}
					}

				// extend object
					else if (typeof props === "object")
					{
						for ( var i in props )
						{
							// getters / setters
								var g = props.__lookupGetter__(i), s = props.__lookupSetter__(i);
								if ( g || s )
								{
									if ( g ) obj.__defineGetter__(i, g);
									if ( s ) obj.__defineSetter__(i, s);
								}

							// normal property
								else
								{
									obj[i] = props[i];
								}
						}
					}

				// return
					return obj;
			},

			createClass:function(object, $properties, $parent)
			{
				// variables
					var parent, properties;

				// grab correct arguments
					for each(var arg in [$parent, $properties])
					{
						if(typeof arg === 'function')
							parent = arg;
						else if(typeof arg === 'object')
							properties = arg;
					}

				// extend object from a parent
					if(parent)
					{
						// set up the inheritance chain
							function Inheritance()
							{
								this.superConstructor		= parent;
								this.superClass				= parent.prototype;
							}
							Inheritance.prototype			= parent.prototype;
							object.prototype				= new Inheritance();
							object.prototype.constructor	= object;

						// create references to parent
							object.superConstructor			= parent;
							object.superClass				= parent.prototype;

						// create super methods

					}

				// add properties to object
					if(properties)
					{
						for(var name in properties)
						{
							// check for accessors
								var getter = properties.__lookupGetter__(name)
								var setter = properties.__lookupSetter__(name);

							// assign accessors
								if (getter || setter)
								{
									if (getter)
									{
										object.prototype.__defineGetter__(name, getter);
									}
									if (setter)
									{
										object.prototype.__defineSetter__(name, setter);
									}
								}

							// assign vanilla properties
								else
								{
									object.prototype[name] = properties[name];
								}
						}
					}
			},

			clone:function(obj)
			{
				if(obj == null || typeof(obj) != 'object')
				{
					return obj;
				}

				var temp = obj.constructor() || {}; // changed

				for(var key in obj)
				{
					temp[key] = Utils.clone(obj[key]);
				}

				return temp;
			},

			/**
			 * Trims the whitespace from both sides of a string
			 * @param	{String}	string		The input string to trim
			 * @returns	{String}				The trimmed string
			 */
			trim:function(string)
			{
				return String(string || '').replace(/(^\s*|\s*$)/g, '');
			},

			/**
			 * Pads a value to a certain length with a specific character
			 * @param	{Value}		value		Any value
			 * @param	{Number}	length		An optional length, defaults to 6
			 * @param	{String}	chr			An optional padding character, defaults to 0
			 * @param	{Boolean}	right		An optional flag to pad to the right, rather than the left
			 * @returns	{String}				The padded value
			 */
			pad:function(value, length, chr, right)
			{
				value	= String(value || '');
				chr		= chr || '0';
				length	= typeof length === 'undefined' ? 6 : length;
				while(value.length < length)
				{
					right ? value += chr : value = chr + value;
				}
				return value;
			},

			/**
			 * Checks if the object is a true array or not
			 *
			 * @param	{Object}	obj			Any object that needs to be checked if it's a true Array
			 * @returns	{Boolean}				True or false
			 */
			isArray:function (obj)
			{
				return Object.prototype.toString.call(obj) === "[object Array]";
			},

			/**
			 * Turns a single value into an array
			 * It either returns an existing array, splits a string at delimiters, or wraps the single value in an array
			 *
			 * @param	{String}	value		A string
			 * @param	{RegExp}	delim		An optional RegExp with which to split the input string, defaults to any non-word character
			 * @param	{String}	delim		An optional character with which to split the string
			 * @returns	{Array}					A new Array
			 */
			toArray:function(value, delim)
			{
				// if delimiter is not supplied, default to any non-word character
					delim = delim || /\W+/;

				// if the value is already an array, return
					if(Utils.isArray(value))
					{
						return value;
					}

				// if the value is a string, start splitting
					else if(typeof value === 'string')
					{
						// trim
							value = Utils.trim(value);

						// variables

						// if RegExp, split
							if(delim instanceof RegExp)
							{
								delim.global = true;
								return value.split(delim);
							}

						// else if String split
							else
							{
								delim		= delim.replace(/([\\\|\*\+])/g, '\\$1')
								var rxTrim	= new RegExp('^[\\s' +delim+ ']+|[\\s' +delim+ ']+$', 'g');
								var rxSplit	= new RegExp('\\s*' +delim+ '+\\s*', 'g');
								return value.replace(rxTrim, '').split(rxSplit);
							}

					}
					else
					{
						throw new TypeError('Utils.toArray() expects a string');
					}
					return [value];
			},

			/**
			 * Returns a unique array without any duplicate items
			 *
			 * @param	{Array}		arr			Any array
			 * @returns	{Array}					A unique array
			 */
			toUniqueArray:function(arr)
			{
				var arrOut	= [];
				var i		= -1;
				while(i++ < arr.length - 1)
				{
					if(arrOut.indexOf(arr[i]) === -1)
					{
						arrOut.push(arr[i]);
					}
				}
				return arrOut;
			},

			/**
			 * Basic numeric Array sort function
			 * @param	{Array}		arr			An array to sort
			 * @param	{Boolean}	reverse		An optional flag to sort in reverse (descending) order
			 * @returns	{Array}					The sorted Array
			 */
			sort:function(arr, reverse)
			{
				function asc(a, b)  { return a - b }
				function desc(a, b) { return b - a }
				return arr.sort(reverse == true ? desc : asc);
			},

			/**
			 * Optimized Array sortOn method, for sorting Arrays by child property. This function modifies the input Array
			 * @param	{Array}		arr			An Array of Objects
			 * @param	{String}	prop		A property name to sort on; defaults to 'name'
			 * @param	{Boolean}	alpha		An optional flag to sort alphabetically
			 */
			sortOn:function(arr, prop, alpha)
			{
				function swap(arr, a, b)
				{
					var tmp = arr[a];
					arr[a] = arr[b];
					arr[b] = tmp;
				}

				function partition(array, begin, end, pivot)
				{
					var piv = alpha ? String(array[pivot][prop]).toLowerCase() : array[pivot][prop];
					swap(array, pivot, end - 1);
					var store = begin;
					var ix;
					for(ix = begin; ix < end - 1; ++ix)
					{
						if((alpha ? String(array[ix][prop]).toLowerCase() : array[ix][prop]) <= piv)
						{
							swap(array, store, ix);
							++store;
						}
					}
					swap(array, end - 1, store);

					return store;
				}

				function qsort(array, begin, end)
				{
					if(end - 1 > begin)
					{
						var pivot	= begin + Math.floor(Math.random() * (end - begin));
						pivot		= partition(array, begin, end, pivot);
						qsort(array, begin, pivot);
						qsort(array, pivot + 1, end);
					}
				}

				prop = prop || 'name';
				qsort(arr, 0, arr.length);
			},

			/**
			 * Get an Array of values from an Object, or an Array of Arrays/Objects from an Array of Objects
			 *
			 * @param	{Array}		input		An Object or an array of Objects
			 * @param	{String}	prop		The name of a property to collect
			 * @param	{Function}	prop		A callback function of the format function propertyName(element){ return element.property }
			 * @param	{Array}		prop		The names of properties to collect
			 * @param	{Boolean}	prop		A Boolean indicates you want to collect ALL properties
			 * @param	{Boolean}	option		If passing and returning a single object, pass true to make it unique. If returning a 2D array, pass true to return Objects
			 * @returns	{Array}					A new 1D or 2D Array
			 */
			getValues:function(input, prop, option)
			{
				// variables
					var output	= [];
					var i		= -1;
					var single	= false;
					prop		= prop || true;

				// convert input to array if just a single object
					if( ! Utils.isArray(input))
					{
						input	= [input];
						single	= true;
					}

				// collect all values?
					if(prop === true)
					{
						prop = Utils.getKeys(input[0]);
					}

				// double loop for multiple properties
					if(Utils.isArray(prop))
					{
						// variables
							var propName;
							var props			= prop;
							var functionNames	= [];
							var output			= new Array(input.length);

						// check if any of the property names are actually functions, and if so, grab the function name in advance
							for(var f = 0; f < props.length; f++)
							{
								if(typeof props[f] === 'function')
								{
									functionNames[f] = Source.parseFunction(props[f]).name;
								}
							}

						// return objects
							if(option)
							{
								while(i++ < input.length - 1)
								{
									output[i] = {};
									for(var j = 0; j < props.length; j++)
									{
										propName = functionNames[j] || props[j];
										output[i][propName] = functionNames[j] ? props[j](input[i]) : input[i][propName];
									}
								}
							}

						// return arrays
							else
							{
								while(i++ < input.length - 1)
								{
									output[i] = new Array(props.length);
									for(var j = 0; j < props.length; j++)
									{
										output[i][j] = functionNames[j] ? props[j](input[i]) : input[i][props[j]];
									}
								}
							}
					}

				// single loop for collecting only a single property
					else
					{
						while(i++ < input.length - 1)
						{
							if( ! option || (option && output.indexOf(input[i][prop]) === -1) )
							{
								output.push(typeof prop === 'function' ? prop(input[i]) : input[i][prop]);
							}
						}
					}

				// return
					return single ? output[0] : output;
			},

			/**
			 * Gets properties from an object's namespace via a dot.syntax.path String
			 * @param	{Object}	obj			The root object from which to extract the deep value
			 * @param	{String}	path		The dot-path to an existing object property
			 * @returns	{Value}					The value of the property, if it exists
			 */
			getDeepValue:function(obj, path)
			{
				path = String(path);
				if(path.indexOf('.') == -1)
				{
					return obj[path];
				}
				else
				{
					var keys = path.split('.');
					while(keys.length > 1)
					{
						key = keys.shift();
						if(key in obj)
						{
							obj = obj[key];
						}
						else
						{
							return;
						}
					}
					return obj[keys[0]];
				}
			},

			/**
			 * Add nested properties to an object's namespace via a dot.syntax.path String
			 * @param	{Object}	obj			The root object on which to create the deep value
			 * @param	{String}	path		A dot-syntax path to a new object property
			 * @param	{Object}	properties	An object or value to add to the new namespace
			 */
			setDeepValue:function(obj, path, properties)
			{
				path		= String(path);
				var keys	= path.split('.');
				do
				{
					// get the next key
						var key = keys.shift();

					// extend
						if(keys.length > 0)
						{
							if( ! (key in obj) )
							{
								obj[key] = {};
							}
							obj = obj[key];
						}

					// assign
						else
						{
							//trace(key)
							//trace(obj)
							if( ! (key in obj) )
							{
								trace('assigning')
								obj[key] = properties;
							}
							else
							{
								trace('extending')
								Utils.extend(obj[key], properties);
							}

						}
				}
				while(keys.length);
			},

			/**
			 * Comparison function to get a max or min value within an array of objects
			 * @param	{Array}		elements		An Array of objects with named properties
			 * @param	{String}	prop			The property to test
			 * @param	{Boolean}	returnElements	An optional flag to return the element, rather than the value
			 * @returns	{Array}						A 2-element Array containing the min and max values, or min and max elements
			 */
			getExtremeValues:function(elements, prop, returnElement)
			{
				// comparison function
					function test(element, index, elements)
					{
						var value = element[prop];
						if(value > maxValue)
						{
							maxValue	= value;
							maxElement	= element;
						}
						else if(value < minValue)
						{
							minValue	= value;
							minElement	= element;
						}
					}

				// catch empty array
					if( ! elements || ! Utils.isArray(elements) || elements.length < 1)
					{
						return {min:undefined, max:undefined};
					}

				// variables
					var minElement	= elements[0];
					var maxElement	= elements[0];
					var minValue	= elements[0][prop];
					var maxValue	= elements[0][prop];

				// test
					elements.forEach(test);

				// return
					return returnElement ? [minElement, maxElement] : [minValue, maxValue];
			},


			/**
			 * Get an object's keys, or all the keys from an Array of Objects
			 *
			 * @param	{Object}	obj			Any object with iterable properties
			 * @param	{Array}		obj			An Array of objects with iterable properties
			 * @returns	{Array}					An array of key names
			 */
			getKeys:function(obj)
			{
				var keys	= [];
				var arr		= obj.constructor === Array ? obj : [obj];
				for(var i = 0; i < arr.length; i++)
				{
					for(var key in arr[i])
					{
						if(keys.indexOf(key) == -1)
						{
							keys.push(key);
						}
					}
				}
				return keys
			},

			/**
			 * Get the arguments of a function as an Array
			 * @param	{Arguments}	args		An arguments object
			 * @param	{Number}	startIndex	Optional index of the argument from which to start from
			 * @param	{Number}	endIndex	Optional index of the argument at which to end
			 * @returns	{Array}					An Array of parameters
			 */
			getArguments:function(args, startIndex, endIndex)
			{
				return params = Array.slice.apply(this, [args, startIndex || 0, endIndex || args.length]);
			},

			/**
			 * Get the class of an object as a string
			 *
			 * @param	{value}		value		Any value
			 * @returns	{String}				The class name of the value i.e. 'String', 'Date', 'CustomClass'
			 */
			getClass:function(obj)
			{
				if (obj != null && obj.constructor && obj.constructor.toSource !== undefined)
				{
					// match constructor function name
						var matches = obj.constructor.toSource().match(/^function\s*(\w+)/);
						if (matches && matches.length == 2)
						{
							// fail if the return value is an anonymous / wrapped Function
								if(matches[1] != 'Function')
								{
									//trace('Constructor')
									return matches[1];
								}

							// attempt to grab object toSource() result
								else
								{
									matches = obj.toSource().match(/^function\s*(\w+)/);
									if(matches && matches[1])
									{
										//trace('Source')
										return matches[1];
									}

								// attempt to grab object toString() result
									else
									{
										matches = obj.toString().match(/^\[\w+\s*(\w+)/);
										if(matches && matches[1])
										{
											//trace('String')
											return matches[1];
										}
									}
								}
					}
				}

				return undefined;
			},

			/**
			 * Returns the named SWF panel if it exists
			 * @param	{String}	name		The panel name
			 * @returns	{SWFPanel}				An SWFPanel object
			 */
			getPanel:function(name)
			{
				if(name)
				{
					name = String(name).toLowerCase();
					for(var i = 0; i < fl.swfPanels.length; i++)
					{
						if(fl.swfPanels[i].name.toLowerCase() === name)
						{
							return fl.swfPanels[i];
						}
					}
				}
				return null;
			},

			/**
			 * Returns an array of the the currently executing files, paths, lines, and code
			 *
			 * @param	{Error}		error		An optional error object
			 * @param	{Boolean}	shorten		An optional Boolean to shorten any core paths with {xjsfl}
			 * @returns	{Array}					An array of the executing files, paths, lines and code
			 */
			getStack:function(error, shorten)
			{
				// variables
					var rxParts		= /^(.*?)@(.*?):(\d+)$/mg;
					var rxFile		= /(.+?)([^\\\/]*)$/;

				// error
					var strStack	= (error instanceof Error ? error : new Error('Stack trace')).stack;

				// parse stack
					var matches		= strStack.match(rxParts);
					if( ! error )
					{
						matches = matches.slice(2); // remove the fake error
					}

				// parse lines
					var stack		= [];
					var xjsflPath	= FLfile.uriToPlatformPath(xjsfl.uri);
					var parts, fileParts, path, file;

					for (var i = 0; i < matches.length; i++)
					{
						// error, file, line number
							rxParts.lastIndex	= 0;
							parts				= rxParts.exec(matches[i]);

						// file parts
							fileParts			= (parts[2] || '').match(rxFile);
							path				= fileParts ? fileParts[1] : '';
							file				= fileParts ? fileParts[2] : '';

						// stack object
							stack[i] =
							{
								line	:parseInt(parts[3]) || '',
								code	:parts[1] || '',
								file	:file,
								path	:window.URI ? URI.asPath(path, shorten) : path,
								uri		:FLfile.platformPathToURI(path + file)
							};
					}

				// return
					return stack;
			},

			/**
			 * Returns a list of URIs for a given folder reference and optional condition
			 * @param	{String}	ref			An absolute or relative folder path or URI (wildcards allowed)
			 * @param	{Folder}	ref			A valid Folder instance
			 * @param	{Array}		ref			An Array of URIs (each of which are filtered then passed back)
			 * @param	{Number}	$depth		An optional max depth to search to
			 * @param	{Boolean}	$filesOnly	An optional Boolean to get files only
			 * @param	{RegExp}	$filter		A RegExp to match each URI
			 * @param	{Array}		$extensions	An Array of extensions to match
			 * @returns	{Array}					An Array of URIs
			 */
			getURIs:function(ref, $depth, $filesOnly, $filter, $extensions)
			{
				// folder uri;
					var uri;

				// Array
					if(ref instanceof Array)
					{
						return ref;
					}

				// Folder: new Folder()
					if(ref instanceof Folder)
					{
						uri = ref.uri;
					}

				// path or URI
					else if(URI.isURI(ref))
					{
						if(ref.indexOf('*') > -1)
						{
							Data.recurseFolder(ref, true);
						}
						else
						{
							return new Folder(URI.getPath(ref)).uris;
						}
					}

				// otherwise, return Array
					return [ref];

				// folder URI: c:/temp/
				// folder URI: c:/temp/*
				// name: 'template', 'library'
				// Array: ['template', 'filesystem'], 'library'

			},


			/**
			 * Parse any string into a real datatype. Supports Number, Boolean, hex (0x or #), XML, XMLList, Array notation, Object notation, JSON, Date, undefined, null
			 * @param	{String}	value		An input string
			 * @param	{Boolean}	trim		An optional flag to trim the string, on by default
			 * @returns	{Mixed}					The parsed value of the original value
			 */
			parseValue:function(value, trim)
			{
				// trim
					value = trim !== false ? Utils.trim(value) : value;

				// undefined
					if(value === 'undefined')
						return undefined;

				// null - note that empty strings will be returned as null
					if(value === 'null' || value === '')
						return null;

				// Number
					if(/^(\d+|\d+\.\d+|\.\d+)$/.test(value))
						return parseFloat(value);

				// Boolean
					if(/^true|false$/i.test(value))
						return value.toLowerCase() === 'true' ? true : false;

				// Hexadecimal String / Number
					if(/^(#|0x)[0-9A-F]{6}$/i.test(value))
						return parseInt(value[0] === '#' ? value.substr(1) : value, 16);

				// XML
					if(/^<(\w+)\b[\s\S]*(<\/\1>|\/>)$/.test(value))
					{
						try { var xml = new XML(value); } // attempt to create XML
						catch(err)
						{
							try { var xml = new XMLList(value); } // fall back to XMLList
							catch(err) { var xml = value; } // fall back to text
						};
						return xml
					}

				// Array notation
					if(/^\[.+\]$/.test(value))
						return eval(value);

				// Object notation
					if(/^{[a-z]\w*:.+}$/i.test(value))
						return eval('(' + value + ')');

				// JSON
					if(/^{"[a-z]\w*":.+}$/i.test(value))
						return JSON.parse(value);

				// Date
					if( ! isNaN(Date.parse(value)))
						return new Date(value);

				// String
					return value;
			},

			/**
			 * Randomnly modify a seed value with a secondary modifier component
			 * @param	{Number}	value		A value to modify
			 * @param	{Number}	modifier	An optional modifier component with which to modify the original value
			 * @param	{String}	modifier	An optional modifier component with which to modify the original value, with optional leading +,-,* or a trailing %
			 * @returns	{Number}				The modified value
			 */
			randomizeValue:function(value, modifier)
			{
				// value is a number
					if(typeof value === 'number')
					{
						// if a modifier is supplied,
							if(modifier != undefined)
							{
								// if a string is supplied,
									if(typeof modifier == 'string')
									{
										// value
											var matches = modifier.match(/([+-\/*])?(\d+(.\d+)?)(%)?/);
											if(matches)
											{
												// variables
													var modified;

												// components
													var sign	= matches[1];
													var offset	= parseFloat(matches[2]);
													var percent	= matches[4];

												// offset
													if(percent)
													{
														if(sign === '+' || sign === '-')
														{
															offset	= value * (offset / 100)
														}
														else if(sign === '*' || sign === '/')
														{
															offset	= (offset / 100);
														}
													}

												// modify value
													switch(sign)
													{
														case '+':
															modified = value + offset * Math.random();
														break;

														case '-':
															modified = value - offset * Math.random();
														break;

														case '*':
															modified = value * offset * Math.random();
														break;

														case '/':
															modified = value / offset * Math.random();
														break;

														default: // either side
															modified = value + (offset * Math.random()) - (offset / 2);
															//modified = value + (offset * 2 * Math.random()) - offset;

													}

													return modified;
											}
											else
											{
												return value;
											}

									}

								// otherwise, update according to the number
									else
									{
										return value + modifier * Math.random();
									}
							}

						// if a number is supplied, just randomize it
							else
							{
								return value * Math.random();
							}
					}

				// if value is an array, simply return a value between the two numbers
					else if(value instanceof Array)
					{
						return Utils.randomValue(value[0], value[1]);
					}

				// return
					return value;
			},

			/**
			 * Get a random value between 2 numbers
			 * @param	{Array}		a			A 2-element array defining the lower and upper limits
			 * @param	{Number}	a			The lower limit of the range
			 * @param	{Number}	b			The lower limit of the range
			 * @param	{Number}	round		An optional Boolean to round to the nearest integer value
			 * @returns	{Number}				A number between a and b
			 */
			randomValue:function(a, b, round)
			{
				if(a instanceof Array)
				{
					round = b;
					b = a[1];
					a = a[0];
				}
				var value = a + (b - a) * Math.random();
				return round ? Math.round(value) : value;
			},

			/**
			 * Run each element of an array through a callback function
			 * Used to call functions in a loop without writing loop code or forEach closure, or checking that original argument is an array
			 *
			 * @param	{Array}		arr			An array of elements to be passed to the callback
			 * @param	{Function}	func		The function to call
			 * @param	{Array}		params		An opptional array of arguments to be passed
			 * @param	{Number}	argIndex	An optional argument index in which the original array element should be passed
			 */
			applyEach:function(arr, func, params, argIndex)
			{
				// defaults
					params 		= params || [];
					argIndex	= argIndex || 0;

				// if only a single element is passed, wrap it in an array
					if( ! Utils.isArray(arr))
					{
						arr = [arr];
					}

				// for each element, call the function with the parameters
					arr.forEach
					(
						function(element, index, elements)
						{
							var args = [].concat(params);
							args.splice(argIndex, 0, element);
							func.apply(this, args);
						}
					)

				// return
					return this;
			},

			toString:function()
			{
				return '[class Utils]';
			}
		}

	// ---------------------------------------------------------------------------------------------------------------
	// register

		if(xjsfl && xjsfl.classes)
		{
			xjsfl.classes.register('Utils', Utils);
		}