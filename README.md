# pacer-cytoscape-browser

##  Overview

Simple interactive browser for a pacer graph.

![example](https://idgon-assets.s3.amazonaws.com/graph.jpg)

### Features

* click to view raw node propertieis
* right click to expand node
* massage script to size nodes

### Plans

* search and center
* highlight neighbors
* import multiple graphs
* anotate graph
* pull in .js with bower or something
* contract nodes
* style configuration 


### running sample

ensure jruby is running

```sh
bundle install
cp graph-of-the-gods.xml gd.graphml
ruby massage.rb
ruby api-server.rb
```

1. browse to http://\<your server\>:4567/app.html
2. right click on the root node to expand it, right click on any expanded nodes to expand them
3. click the html buttons in the upper left to change the layout

### Environment

jruby 9000: jruby 9.0.0.0 (2.2.2) 2015-07-21

```ruby
GEM
  specs:
    httpclient (2.8.2.4)
    lock_jar (0.12.6)
      naether (~> 0.14.3)
      thor (>= 0.18.1)
    naether (0.14.3-java)
      httpclient
    pacer (2.0.24-java)
      lock_jar (~> 0.12.0)
    thor (0.19.1)

PLATFORMS
  java

DEPENDENCIES
  pacer

BUNDLED WITH
   1.13.2
```
