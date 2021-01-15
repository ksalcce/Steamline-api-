Streamline

Live link: https://streamline-dusky.vercel.app/

Client repo: https://github.com/greynagle/streamline

Structure:
```.
├── /main
│   └── GET
│       ├── /parts/all
│       ├── /parts/false
│       ├── /parts/:id
│       ├── /assemblies/all
│       ├── /assemblies/false
│       ├── /assemblies/:id
│       ├── /machines/all
│       ├── /machines/false
│       └── /tests/all
│   └── POST
│       ├── /parts/
│       ├── /assemblies/
│       ├── /machines/
│       └── /tests/
```

_______________________________________

The Streamline app is a factory simulation where users define components and the machines that process them, and then run tests. The tests return time values for processing that allow users to make judgements for resource allocation re number of machines or taking steps to speed up the processing of individual components.

_______________________________________

This app is powered in the front-end by React & React Router, and in the back-end by NodeJS, Express, PostgresQL, & Knex.js
