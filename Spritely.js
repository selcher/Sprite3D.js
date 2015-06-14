/*
* Spritely.js v1.0.0
*
* A fork of Sprite3D.js - v2.0.2
* https://github.com/boblemarin/Sprite3D.js
*
* Copyright (c) 2010 boblemarin emeric@minimal.be http://www.minimal.be
* 
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

( function( w ) {

	/**
	 * Check current browser for CSS 3D transforms support.
	 */
	var browserPrefix = ( function initBrowserPrefix() {

		var d = document.createElement( "div" ), 
			prefix = "webkit",
			prefixes = [ "ms", "o", "Moz", "webkit", "" ],
			n = prefixes.length,
			i;

		for( i = n; i--; ) {

			prefix = prefixes[ i ];

			if ( ( prefix + "Perspective" ) in d.style ) {
				break;
			}
		}

		return prefix;

	} )();

	/**
	 * Class: Spritely
	 * @class Spritely
	 *
	 * Creates an instance of Spritely
	 *
	 * @constructor
	 * @this {Spritely}
	 * @param {Object} element The DOM element to wrap the Spritely object around.
	 */
	function Spritely( element ) {

		if ( this instanceof Spritely ) {

			// create an empty <div> if no element is provided
			if ( typeof element === "undefined" ) { element = document.createElement( "div" ); }

			// add whitespace in content for Firefox to render the div
			if ( element.innerHTML === "" ) { element.innerHTML = "&nbsp;"; }

			// prepare for 3D positionning
			element.style[ this._browserPrefix + "TransformStyle" ] = "preserve-3d";
			element.style.margin = "0px";
			element.style.padding = "0px";
			element.style.position = "absolute";

			// trigger hardware acceleration even if no property is set
			element.style[ this._transformProperty ] = "translateZ(0px)";

			// debug style
			//element.style.border = '1px solid red';

			/** A reference to the CSS style object of the DOM element */
			this.style = element.style;

			/** A reference to the DOM element associated with this Spritely object */
			this.domElement = element;

			/** An array holding references of the Spritely's children object */
			this.children = [];
			this.numChildren = 0;

			/** The size of the HTML element associated with the Spritely object */
			this.width = 0;
			this.height = 0;

			/** The axis position of the Spritely */
			this.x = 0;
			this.y = 0;
			this.z = 0;

			/** The axis registration point of the Spritely object used for 3D positionning */
			this.regX = 0;
			this.regY = 0;
			this.regZ = 0;

			/** The opacity of the Spritely */
			this.alpha = 1;

			/** The axis rotation of the Spritely */
			this.rotationX = 0;
			this.rotationY = 0;
			this.rotationZ = 0;

			/** A boolean value to decide in which order transformations are applied.
			 * If true, rotations are applied before translations.
			 * If false, translations are applied before rotations.
			 * For a more accurate control over transformations order,
			 * you should use the transformString property. This property is now BROKEN.
			 */
			this.rotateFirst = false;

			/** The axis scale of the Spritely */
			this.scaleX = 1;
			this.scaleY = 1;
			this.scaleZ = 1;

			/** The size (in pixels) of the tiles in the spritesheet */
			this.tileWidth = 0;
			this.tileHeight = 0;

			/**
			 * The transform string. You can use this property to fine control the order in which transformations are applied.
			 * The following values will be replaced by their respective transformations :
			 * _p for position/translations
			 * _s for scaling
			 * _rx for rotationX
			 * _ry for rotationY
			 * _rz for rotationZ
			 * Example: sprite.transformString = "_rx _ry _rz _p _s";
			 */
			this.transformString = "_p _rx _ry _rz _s";
			this.pos = ""; 
			this.rx = "";
			this.ry = "";
			this.rz = "";
			this.scale = "";

			return this;

		} else {

			return new Spritely( element );

		}

	}

	/** Private static property. Used internally for cross-browser compatibility. You should not change its value. */
	Spritely.prototype._browserPrefix = browserPrefix;
	Spritely.prototype._transformProperty = browserPrefix + "Transform";

	/**
	 * Method: setTrasnsformString
	 *
	 * Sets the value of the transformString property, allowing to control transformations order.
	 * A valid value may be "_rx _ry _rz _p _s". See the transformString property for more informations.
	 *
	 * @param {String} ts The string that will be used to swap
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setTransformString = function( ts ) {

		this.transformString = ts;

		return this;

	};

	/**
	 * Method: setX
	 *
	 * Sets the X-axis position of the Spritely.
	 *
	 * @param {Number} px The position
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setX = function( px ) {

		this.x = px;
		
		return this;

	};

	/**
	 * Method: setY
	 *
	 * Sets the Y-axis position of the Spritely.
	 *
	 * @param {Number} py The position
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setY = function( py ) {

		this.y = py;
		
		return this;
	
	};

	/**
	 * Method: setZ
	 *
	 * Sets the Z-axis position of the Spritely.
	 *
	 * @param {Number} pz The position
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setZ = function( pz ) {

		this.z = pz;
		
		return this;
	
	};

	/**
	 * Method: setPosition
	 *
	 * Sets the 3D position of the Sprite.
	 *
	 * @param {Number} px The position on the X-axis
	 * @param {Number} py The position on the Y-axis
	 * @param {Number} pz The position on the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setPosition = function( px, py, pz ) {

		this.x = px;
		this.y = py;
		this.z = pz;

		return this;

	};

	/**
	 * Method: moveX
	 *
	 * Applies a relative translation in 3D space on the X-axis.
	 *
	 * @param {Number} px The value of the translation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.moveX = function( px ) {

		this.x += px;

		return this;

	};

	/**
	 * Method: moveY
	 *
	 * Applies a relative translation in 3D space on the Y-axis.
	 *
	 * @param {Number} py The value of the translation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.moveY = function( py ) {

		this.y += py;

		return this;

	};

	/**
	 * Method: moveZ
	 *
	 * Applies a relative translation in 3D space on the Z-axis.
	 *
	 * @param {Number} pz The value of the translation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.moveZ = function( pz ) {

		this.z += pz;

		return this;

	};

	/**
	 * Method: move
	 *
	 * Applies a relative translation in 3D space.
	 *
	 * @param {Number} px The value of the translation on the X-axis
	 * @param {Number} py The value of the translation on the Y-axis
	 * @param {Number} pz The value of the translation on the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.move = function( px, py, pz ) {

		this.x += px;
		this.y += py;
		this.z += pz;
		
		return this;
	
	};

	/**
	 * Method: setRotationX
	 *
	 * Sets the amount of rotation around the X-axis of the Spritely.
	 *
	 * @param {Number} rx The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRotationX = function( rx ) {

		this.rotationX = rx;

		return this;

	};

	/**
	 * Method: setRotationY
	 *
	 * Sets the amount of rotation around the Y-axis of the Spritely.
	 *
	 * @param {Number} ry The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRotationY = function( ry ) {

		this.rotationY = ry;

		return this;

	};

	/**
	 * Method: setRotationZ
	 *
	 * Sets the amount of rotation around the Z-axis of the Spritely.
	 *
	 * @param {Number} rz The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRotationZ = function( rz ) {

		this.rotationZ = rz;

		return this;

	};

	/**
	 * Method: setRotation
	 *
	 * Sets the 3D rotation of the Sprite.
	 *
	 * @param {Number} rx The rotation around the X-axis
	 * @param {Number} ry The rotation around the Y-axis
	 * @param {Number} rz The rotation around the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRotation = function( rx, ry, rz ) {

		this.rotationX = rx;
		this.rotationY = ry;
		this.rotationZ = rz;
		
		return this;
	
	};


	/**
	 * Method: rotateX
	 *
	 * Applies a relative rotation in 3D space around the X-axis.
	 *
	 * @param {Number} rx The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.rotateX = function( rx ) {

		this.rotationX += rx;

		return this;

	};

	/**
	 * Method: rotateY
	 *
	 * Applies a relative rotation in 3D space around the Y-axis.
	 *
	 * @param {Number} ry The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.rotateY = function( ry ) {

		this.rotationY += ry;
		
		return this;
	
	};

	/**
	 * Method: rotateZ
	 *
	 * Applies a relative rotation in 3D space around the Z-axis.
	 *
	 * @param {Number} rz The value of the rotation
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.rotateZ = function( rz ) {

		this.rotationZ += rz;

		return this;

	};

	/**
	 * Method: rotate
	 *
	 * Applies a relative rotation in 3D space.
	 *
	 * @param {Number} rx The value of the rotation around the X-axis
	 * @param {Number} ry The value of the rotation around the Y-axis
	 * @param {Number} rz The value of the rotation around the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.rotate = function( rx, ry, rz ) {
		
		this.rotationX += rx;
		this.rotationY += ry;
		this.rotationZ += rz;
		
		return this;
	
	};

	/**
	 * Method: setScaleX
	 *
	 * Sets the scaling of the Spritely object on the X-axis.
	 *
	 * @param {Number} sx The value of the scaling on the X-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setScaleX = function( sx ) {

		this.scaleX = sx;

		return this;

	};

	/**
	 * Method: setScaleY
	 *
	 * Sets the scaling of the Spritely object on the Y-axis.
	 *
	 * @param {Number} sy The value of the scaling on the Y-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setScaleY = function( sy ) {

		this.scaleY = sy;
		
		return this;
	
	};

	/**
	 * Method: setScaleZ
	 *
	 * Sets the scaling of the Spritely object on the Z-axis.
	 *
	 * @param {Number} sz The value of the scaling on the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setScaleZ = function( sz ) {

		this.scaleZ = sz;

		return this;

	};

	/**
	 * Method: setScale
	 *
	 * Sets the scaling of the Spritely object on the 3 axis.
	 * To set the same values to the three scale axis,
	 * pass only one value to this function (ex: setScale(2) )
	 *
	 * @param {Number} sx The value of the scaling on the X-axis
	 * @param {Number} sy The value of the scaling on the Y-axis
	 * @param {Number} sz The value of the scaling on the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setScale = function( sx, sy, sz ) {

		if ( arguments.length == 1 ) {
		
			this.scaleX = sx;
			this.scaleY = sx;
			this.scaleZ = sx;		
		
		} else {
		
			this.scaleX = sx;
			this.scaleY = sy;
			this.scaleZ = sz;
		
		}
		
		return this;
	
	};

	/**
	 * Method: setRegistrationPoint
	 *
	 * Sets the registrations point for the Spritely object. 
	 * By default, CSS positionning is relative to the top left corner of the element.
	 * The registration point values are simply substracted from the position when applied
	 *
	 * @param {Number} rx The registration point value for the X-axis
	 * @param {Number} ry The registration point value for the Y-axis
	 * @param {Number} rz The registration point value for the Z-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRegistrationPoint = function( rx, ry, rz ) {

		this.regX = rx;
		this.regY = ry;
		this.regZ = rz;
		
		return this;
	
	};

	/**
	 * Method: setTransformOrigin
	 *
	 * Sets the origin of the 3D transforms.
	 * By default, CSS transforms are relative to the center of the element.
	 *
	 * @param {Number} px The transform origin value for the X-axis
	 * @param {Number} py The transform origin value for the Y-axis
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setTransformOrigin = function( px, py ) {
	
		this.style[ this._browserPrefix + "TransformOrigin" ] = px + " " + py;
	
		return this;
	
	};

	/**
	 * Method: setSize
	 *
	 * Sets the size of the HTML element linked to the Spritely object, using the width and height css properties.
	 * Note that animating using these properties does not provide an optimal performance.
	 * You should rather try to use CSS scale using the scale() method
	 * This method applies the changes to the style object, so it does not require a call to the update methods
	 *
	 * @param {Number} width The desired width
	 * @param {Number} height The desired height
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setSize = function( width, height ) {

		this.style.width = ( this.width = width ) + "px";
		this.style.height = ( this.height = height ) + "px";
		
		return this;
	
	};

	/**
	 * Method: setOpacity
	 *
	 * Sets the opacity of the element.
	 * This method applies the changes to the style object,
	 * so it does not require a call to the update methods
	 *
	 * @param {Number} alpha The desired opacity, ranging from 0 to 1
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setOpacity = function( alpha ) {

		this.style.opacity = this.alpha = alpha;

		return this;

	};

	/**
	 * Method: getOpacity
	 *
	 * Returns the opacity of the element.
	 *
	 * @return {Number} The opacity of the element
	 */
	Spritely.prototype.getOpacity = function() {

		return this.alpha;
	
	};

	/**
	 * Method: setClassName
	 *
	 * Sets the CSS class name of the DOM element associated with the Spritely object.
	 * When applying multiple class names, provide a single string with space-separated class names like you would do in pure CSS manipulation.
	 * This method does not require a call to the update methods.
	 *
	 * @param {String} className The name of the class to be set
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setClassName = function( className ) {

		this.domElement.className = className;

		return this;

	};

	/**
	 * Method: getClassName
	 *
	 * Returns the name of the CSS class of the DOM element.
	 *
	 * @return {String} The CSS class name
	 */
	Spritely.prototype.getClassName = function() {

		return this.domElement.className;

	};

	/**
	 * Method: addClassName
	 *
	 * Adds a CSS class to the DOM element
	 * This method does not require a call to the update methods.
	 *
	 * @param {String} className The name of the class to be added
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.addClassName = function( className ) {

		this.domElement.className += " " + className + " ";

		return this;

	};

	/**
	 * Method: removeClassName
	 *
	 * Removes a CSS class from the DOM element
	 * This method does not require a call to the update methods.
	 *
	 * @param {String} className The name of the class to be removed
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.removeClassName = function( className ) {

		this.domElement.className = this.domElement.className.replace( className, "" );

		return this;

	};

	/**
	 * Method: setId
	 *
	 * Sets the ID of the DOM element in the document.
	 * This method is just a helper allowing neverending chaining in the Spritely creation syntax.
	 * You can also simply access the <code>domElement</code> property of the Spritely and set its <code>id</code> property.
	 * This method does not require a call to the update methods.
	 *
	 * @param {String} id The ID
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setId = function( id ) {

		this.domElement.id = id;

		return this;

	};

	/**
	 * Method: getId
	 *
	 * Returns the ID of the DOM element associated with the Spritely.
	 *
	 * @return {String} The CSS class name
	 */
	Spritely.prototype.getId = function() {

		return this.domElement.id;
	
	};

	/**
	 * Mehtod: setCSS
	 *
	 * Allows to set any value in any CSS property of the style object of the DOM element.
	 * This method is just a helper allowing neverending chaining in the Spritely creation syntax.
	 * For one time modifications, you can simply use the <code>style</code> property of the Spritely.
	 * This method does not require a call to the update methods.
	 *
	 * @param {String} name The name of the CSS property in which the value will be stored
	 * @param {String} value The value to assign to the property
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setCSS = function( name, value ) {

		this.domElement.style[ name ] = value;
		
		return this;
	
	};

	/**
	 * Method: getCSS
	 *
	 * Returns the value assigned to the provided CSS property.
	 *
	 * @param {String} name The name of the property to get the value from
	 * @return {String} The value of the CSS property
	 */
	Spritely.prototype.getCSS = function( name ) {

		return this.domElement.style[ name ];
	
	};

	/**
	 * Method: setInnerHTML
	 *
	 * Allows direct write access to the innerHTML property of the DOM element.
	 *
	 * @param {String} value The string to write into the innerHTML property
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setInnerHTML = function( value ) {

		this.domElement.innerHTML = value;

		return this;

	};


	/**
	 * Method: setTileSize
	 *
	 * Sets the size of the tiles in the spritesheet used as background image.
	 *
	 * @param {Number} width The desired width
	 * @param {Number} height The desired height
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setTileSize = function( width, height ) {

		this.tileWidth = width;
		this.tileHeight = height;

		return this;

	};

	/**
	 * Method: setTilePosition
	 *
	 * Modifies the sprites's background image position to display the selected tile.
	 * For this method to work, you are supposed to set a background image and
	 * limit the size of the element using CSS styles,
	 * and use a sprite sheet where all tiles have the same size.
	 * No checking is performed on the provided values.
	 *
	 * @param {Number} tilePosX The horizontal index of the tile to be displayed
	 * @param {Number} tilePosY The vertical index of the tile to be displayed
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setTilePosition = function( tilePosX, tilePosY ) {

		this.style.backgroundPosition = "-" +
			( tilePosX * this.tileWidth ) + "px -" +
			( tilePosY * this.tileHeight ) + "px";

		return this;

	};

	/**
	 * Method: setProperty
	 *
	 * Allows to set a arbitary property value while using the chaining syntax.
	 *
	 * @param {String} label The name of the property
	 * @param {Object} value The value for that property
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setProperty = function( label, value ) {

		this[ label ] = value;

		return this;

	};

	/**
	 * Method: setRotateFirst
	 *
	 * Sets the order in which transformations are applied.
	 * If true, rotations are applied before translations. If false, translations are applied before rotations.
	 * Note that, when applying rotations, the axis of the object rotate, and subsequent translations follow the modified orientation of the axis.
	 * For a more accurate control, you should use the transformString property.
	 *
	 * @param {boolean} rf true to rotate first, false to translate first
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.setRotateFirst = function( rf ) {

		this.rotateFirst = rf;

		if ( rf ) {	
			this.transformString = "_rx _ry _rz _p _s";
		} else {
			this.transformString = "_p _rz _ry _rx _s";
		}

		return this;

	};

	/**
	 * Method: update
	 *
	 * Applies position and rotation values.
	 *
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.update = function() {

		this.pos = "translate3d(" +
			( this.x - this.regX ) + "px," +
			( this.y - this.regY ) + "px," +
			( this.z - this.regZ ) + "px) ";
		this.rx = "rotateX(" + this.rotationX + "deg) ";
		this.ry = "rotateY(" + this.rotationY + "deg) ";
		this.rz = "rotateZ(" + this.rotationZ + "deg) ";
		this.scale = "scale3d(" + this.scaleX + ", " + this.scaleY + ", " + this.scaleX + ") ";

		//	transformString = "_rx _ry _rz _p _s";
		var ts = this.transformString;
		ts = ts.replace( "_p", this.pos );
		ts = ts.replace( "_rx", this.rx );
		ts = ts.replace( "_ry", this.ry );
		ts = ts.replace( "_rz", this.rz );
		ts = ts.replace( "_s", this.scale );
		this.style[ this._transformProperty ] = ts;

		return this;

	};

	/**
	 * Method: updateAll
	 *
	 * Applies position and rotation values, as well as opacity and size.
	 *
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.updateAll = function() {

		this.style.opacity = this.alpha;
		this.style.width = this.width + "px";
		this.style.height = this.height + "px";

		return this.update();

	};

	/**
	 * Method: updateChildren
	 *
	 * Calls the update() method on every child of the Spritely object.
	 *
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.updateChildren = function() {

		for ( var i = this.numChildren; i--; ) {
			this.children[ i ].update();
		}

		return this;
	
	};

	/**
	 * Method: updateChildrenAll
	 *
	 * Calls the updateAll() method on every child of the Spritely object.
	 *
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.updateChildrenAll = function() {

		for ( var i = this.numChildren; i--; ) {
			this.children[ i ].updateAll();
		}

		return this;
	
	};

	/**
	 * Method: updateWithChildren
	 *
	 * Updates itself, then calls the update() method on every child of the Spritely object.
	 *
	 * @param {boolean} recursive If set to true, make the update call recursive, update every child's children
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.updateWithChildren = function( recursive ) {

		this.update();

		var childrenList = this.children;
		var fn = recursive ? function( index ) {
			childrenList[ index ].updateWithChildren( recursive );
		} : function( index ) {
			childrenList[ index ].update();
		};

		for ( var i = this.numChildren; i--; ) {

			fn( i );

		}

		return this;

	};

	/**
	 * Method: addChild
	 *
	 * Adds a Spritely object to this Spritely children.
	 *
	 * @param {Spritely} e The Spritely object to add
	 * @return {Spritely} The reference to the added Spritely object
	 */
	Spritely.prototype.addChild = function( e ) {

		this.numChildren = this.children.push( e );
		this.domElement.appendChild( e.domElement );

		return e;

	};

	/**
	 * Method: removeChild
	 *
	 * Removes a Spritely object from this Spritely children.
	 *
	 * @param {Spritely} child The Spritely object to remove
	 * @return {Spritely} The reference to the removed Spritely object. null if the child was not found in this Spritely children list
	 */
	Spritely.prototype.removeChild = function( child ) {

		var n = this.children.indexOf( child );

		if ( n > -1 ) {
			return this.removeChildAt( n );
		}

		return null;

	};

	/**
	 * Method: removeChildAt
	 *
	 * Removes the nth Spritely object from this Spritely children.
	 *
	 * @param {number} n The index of the Spritely object to remove
	 * @return {Spritely} The reference to the removed Spritely object.
	 */
	Spritely.prototype.removeChildAt = function( n ) {

		--this.numChildren;
		this.domElement.removeChild( this.children[ n ].domElement );

		return this.children.splice( n, 1 )[ 0 ];

	};

	/**
	 * Method: findFromDOMElement
	 *
	 * Finds and return the Spritely object associated with the provided DOM element
	 *
	 * @param {Object} element The DOM element
	 * @return {Spritely} The reference to the associated Spritely object. Returns null if no relevant Spritely object was found
	 */
	Spritely.prototype.findFromDOMElement = function( element ) {

		for ( var i = this.numChildren; i--; ) {

			if ( element == this.children[ i ].domElement ) {
				return this.children[ i ];
			}
		
		}

		return null;

	};

	/**
	 * Method: addEventListener
	 *
	 * Adds an event listener to the DOM element for the provided event id.
	 *
	 * @param {String} event The name of the event to watch
	 * @param {Function} callback The callback function
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.addEventListener = function( event, callback ) {

		var fname = event + "_" + callback.name;
		
		if ( typeof this.listeners[fname] === "undefined" ||
			this.listeners[ fname ] === null ) {

			var sprite = this;
			var fn = function( e ) { callback( e, sprite ); };
			
			this.listeners[ fname ] = fn;
			this.domElement.addEventListener( event, fn, false );
		
		}
		
		return this;
	
	};

	/**
	 * Method: removeEventListener
	 *
	 * Removes an event listener to the DOM element for the provided event id.
	 *
	 * @param {String} event The name of the event to watch
	 * @param {Function} callback The callback function
	 * @return {Spritely} The reference to this Spritely object
	 */
	Spritely.prototype.removeEventListener = function( event, callback ) {

		var fname = event + "_" + callback.name;
		
		if ( this.listeners[ fname ] ) {
	
			this.domElement.removeEventListener( event, this.listeners[ fname ], false );
			delete this.listeners[ fname ];
	
		}

		return this;
	
	};


	/**
	 * Method: createCenteredContainer
	 *
	 * Creates a centered empty HTML div element
	 * to be used as root container for the other Spritely objects.
	 *
	 * @return {Spritely} The created Spritely object
	 */
	Spritely.createCenteredContainer = function() {

		var doc = document,
			c = doc.createElement( "div" ),
			s = c.style,
			prefix = this._browserPrefix;

		s[ prefix + "Perspective" ] = "800" + ( prefix === "Moz" ? "px" : "" );
		s[ prefix + "PerspectiveOrigin" ] = "0 0";
		s[ prefix + "TransformOrigin" ] = "0 0";
		s[ prefix + "Transform" ] = "translateZ(0px)";

		s.position = "absolute";
		s.top = "50%";
		s.left = "50%";
		s.margin = "0px";
		s.padding = "0px";

		var sprite = new Spritely( c );

		doc.body.appendChild( c );

		return sprite;

	};

	/**
	 * Method: createTopLeftCenteredContainer
	 *
	 * Creates a top-left aligned empty HTML div element
	 * to be used as root container for the other Spritely objects.
	 *
	 * @return {Spritely} The created Spritely object
	 */
	Spritely.createTopLeftCenteredContainer = function() {

	    var c = document.createElement( "div" ),
			s = c.style,
			prefix = this._browserPrefix;

			s[ prefix + "Perspective" ] = "800" + ( prefix == "Moz" ? "px" : "" );
			s[ prefix + "Transform" ] = "translateZ(0px)";
			
			s.position = "absolute";
			
			var sprite = new Spritely( c );

			document.body.appendChild( c );

			return sprite;
	};


	// Expose Spritely to the global object
	w.Spritely = Spritely;

} )( window );