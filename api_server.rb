require 'sinatra'
require 'json'
require 'pacer'

puts "loading pacer"
g = Pacer.tg
Pacer::GraphML.import(g,"./gd2.graphml")
puts "binding port"

set :bind, '0.0.0.0'
set :public_folder, File.dirname(__FILE__) + '/static'
set :static, true

get '/' do
  first_item = g.v.first.properties
  content_type  :json
  puts first_item
  first_item.to_json
end

get '/v' do
  first_item = g.vertex(params[:id])
  content_type  :json
  puts first_item
  first_item.properties.to_json
end


get '/n' do
  first_item = g.vertex(params[:id])
  sub = first_item.both_e.both_v.subgraph
  nodes = sub.v.to_a.map{|v| 
    #size = v.both_e.count
    size = v[:all_degrees] || 1
    scaled_size = ((size * 20) * 0.1)+20 
    {
      id: v.getId,
      p: v.properties, 
      size: size,
      scaled_size: scaled_size,
      label: "#{v[:name]} (#{size})",
      faveColor: '#6FB1FC'
      }
    }
  edges = sub.e.to_a.map{|e| 
    {
      id: e.getId,
      label: e.label,
      #p: 
        #{
          source: e.in_v.first.getId, 
          target: e.out_v.first.getId
        #}
    }}
  result = {nodes: nodes,edges: edges}
  content_type  :json
  #puts peers
  result.to_json
end

