require 'pacer'
require 'json'
require './config.rb'

g = Pacer.tg
Pacer::GraphML.import(g,"gd.graphml")
g.v.bulk_job{|v| 
  v[:type_freq] = v.out[Conf.group_type].frequencies.to_json
  v[:all_degrees] = v.both_e.count
  if v[:name] == nil
    v[:name] = v[:title]
  end
  }

Pacer::GraphML.export(g,"gd2.graphml")
