// For grunt 0.3.17
// 0.4.x will use grunt.coffee
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-coffee');
  grunt.initConfig({
    lint: {
      files: ["*.js", "*.json", "lib/*.js", "bin/*"]
    },
    jshint: { // @see http://www.jshint.com/docs/
      options: {
        curly: false, // Always need {} for 'if' 'for' etc.
        newcap: false, // for CoffeeScript generated 'new ctor()'
        shadow: true, // for CoffeeScript generated class definition
        undef: true, eqeqeq: true, immed: true, latedef: true,
        noarg: true, sub: true, boss: true, eqnull: true,
        node: true, strict: false
      }
    },
    coffee: {
      app: {
        src: ["src/*.coffee"],
        dest: "lib"
      }
    },
    mochaTest: {
      files: ["test/*.coffee"]
    },
    mochaTestConfig: {
      options: {
        reporter: 'nyan',
        compilers: 'coffee:coffee-script'
      }
    },
    watch: {
      files: ["*.js", "*.json", "src/*.coffee", "test/*.coffee", "bin/*"],
      tasks: "coffee mochaTest lint"
    }
  });
  return grunt.registerTask("default", "coffee mochaTest");
};
