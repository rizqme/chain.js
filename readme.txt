Chain.js

NOTICE: due to some github bug, link to the wiki is:
http://wiki.github.com/raid-ox/chain.js/      <--- (notice the slash at the end)

Chain.js is a jQuery plugin to bind javascript data to html and generate content using the data. It provides automatic data management and content generation. please see wiki for more information.
USAGE

copy chain.js from /build directory to your directory
load it together with jQuery into your page using:

<script src="path/to/jquery.js" language="javascript"></script>
<script src="path/to/chain.js" language="javascript"></script>

DEVELOPER GUIDE

Code Quality
- It is encouraged to adapt the code to the current coding style
- Please verify the code using www.jslint.com 
  (with tolerate eval, breaking, for in and inefficient subscripting on)

Documenting
- Please document your code thoroughly
- Write examples and descriptions
- document codes, which other developers may not understand at first glance

We use Rhino for shell engine, providing tools for creating documentation
and source building. Rhino is included in the latest Java SDK.
For mac os x, follow this instruction:
http://peter.michaux.ca/article/2982

It is very handy to create an alias for Rhino:
$ alias js='java org.mozilla.javascript.tools.shell.Main'
save this in your bash profile

Building From Source Code
to build from source code go to terminal, move to chain directory and do:
$ java org.mozilla.javascript.tools.shell.Main bin/build.js
or if you created an alias
$ js bin/build.js

Generating Documentation
do:
$ java org.mozilla.javascript.tools.shell.Main bin/doc.js
or
$ js bin/doc.js

Including new source file
to include new source file open project.js and add new source to
profile.sources array