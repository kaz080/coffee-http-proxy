module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.initConfig({
    lint: {
      files: ["grunt.coffee", "lib/*.coffee", "tests/*.coffee"]
    },
    mochaTest: {
      files: ["tests/*.coffee"]
    },
    mochaTestConfig: {
      options: {
        reporter: 'nyan',
        compilers: 'coffee:coffee-script'
      }
    },
    watch: {
      files: ["grunt.js", "*.coffee", "lib/*.coffee", "tests/*.coffee"],
      tasks: "mochaTest"
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
      globals: {}
    }
  });
  return grunt.registerTask("default", "mochaTest");
};
