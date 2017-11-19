# ejscli

> EJS template command line tool

# Usage

Install via `npm install -g ejscli`, or as preferred.

`ejscli -c [module or json context for template] -o [module or json options to pass ejs] files...`

Run each template specified in `files` arguments.
All modules or json passed via `-c` will be provided as context to the template
All modules or json passed via `-o` will be passed to the [ejs compile as an option](https://github.com/mde/ejs#options).
Pass `-` as a file to read from stdin.
Multiple files will be concatted, in the order issued in the arguments.
