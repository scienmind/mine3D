var Game = {

	gameover : false,

	init : function( gl ) {

		Stats.init();
		Stats.loadSettings();

		Settings.init();

		Menu.init();

		Camera.init();

		Element.init( gl );
		Grid.init();

		if ( useBackgroundTextures ) {

			Background.init( gl );

		}

		// moved to Menu.showHUD()
		// EventHandler.init();

		this.reset();

	},

	draw : function( gl ) {

		var redraw = false;

		if ( Settings.animations && TWEEN.getAll().length ) {

			if ( Grid.leftClicked || Grid.rightClicked ) {

				TWEEN.completeAll();

				// Grid.leftClicked = Grid.rightClicked = false;

			}

			TWEEN.update();

			redraw = true;

		}


		Grid.update();


		if ( Camera.update() ) {

			Element.updateMatrix( gl );

			if ( Camera.updateRotation ) {

				Camera.updateFaceDirections( gl, Face.vertices, Face.attributeBuffer );

			}

			Grid.setElementInRay( null );

			redraw = true;

		}

		if ( Camera.updateRay ) {

			Grid.getCubeInRay( Camera.getMouseRay() );

		}


		if ( Grid.redraw || redraw ) {

			if ( useBackgroundTextures ) {

				Background.draw( gl );

			} else {

				gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

			}

			Grid.draw( gl );

			// gl.uniformMatrix4fv( Element.shader.mvMatrixUniform, false, mat4.identity( mat4.create() ) );
			// Icosahedron.draw( gl, Element.shader, 0 );

		}

	},

	drawWithFBO : function( gl, fbo ) {

		if ( this.gameover ) {

			gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		} else {

			gl.clear( gl.COLOR_BUFFER_BIT );

		}

		gl.bindFBO( fbo );

		Grid.draw( gl );

		gl.drawFBO( fbo, Element.shader );

		gl.passTexture( Element.texture, Element.shader.textureUniform );
		Element.updateMatrix( gl );

	},

	reset : function() {

		this.gameover = false;

		Camera.reset();

	},

	start : function( resize ) {

		this.saveStats( Grid.playTime, false );

		if ( resize ) {

			Grid.init();

		} else {

			Grid.start();

		}

		this.reset();

	},

	restart : function() {

		this.saveStats( Grid.playTime, false );

		Grid.restart();

		this.reset();

	},

	over : function( won, element ) {

		var name = Settings.getKey();

		this.saveStats( Grid.playTime, won );

		this.gameover = true;

		Grid.showMines( won, element );

		if ( won ) {

			if ( Settings.currentLevel.name !== 'custom' && 
				Stats.updateScores( name, Grid.playTime ) ) {

				Menu.showScores( name );

			}

			Menu.win();

		} else {

			Menu.lose();

		}

	},

	saveStats : function( time, won ) {

		if ( !this.gameover && Grid.started ) {

			Stats.updateStats( time, won );
			Menu.updateStats();

		}

	}

};
