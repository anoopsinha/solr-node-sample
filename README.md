Solr Node Sample App
====================

Introduction
------------

This is a sample easy to use search web application that sits on top
of Apache Solr.

This is headed towards being a demo application for cloudfoundry.com
that allows access to Solr as a search service.

Features
--------

* JSON items in & out - access items stored in SOLR as JSON document
* Instant search - searches character by character as you are typing
* Pagignation - you can set the number of rows to display
* Summary fields - 'Options' do choose which fields to show
* Details - Clicking on an item shows the full item



Instructions
------------

Currently only local installation.


#### Step 1. Get Apache Solr.  

* Download from http://www.apache.org/dyn/closer.cgi/lucene/solr/3.5.0  

  cd apache-solr-3.5.0/example/
  java -jar start.jar

* Be sure Solr is running by checking: http://localhost:8983/solr/admin


#### Step 2. Clone or fork this repository

     cd solr-node-sample/
     node app.js

#### Step 3. Browse the interface locally from a web browser

     open http://localhost:3000/


  



