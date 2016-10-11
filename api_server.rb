require 'sinatra'
require 'json'
require 'pacer'
require './config.rb'

puts "loading pacer"
g = Pacer.tg
Pacer::GraphML.import(g,"./gd2.graphml")
puts "binding port"

set :bind, '0.0.0.0'
set :public_folder, File.dirname(__FILE__) + '/static'
set :static, true
@empty_graph = Pacer.tg

group_type = :type

get '/' do
  first_item = g.v.first.properties
  content_type  :json
  puts first_item
  first_item.to_json
end

get '/v' do
  v = g.vertex(params[:id])
  node = Gr.dress(v)
  content_type  :json
  node.to_json
end


get '/n' do
  puts "params: #{params}"
  v = g.vertex(params["id"])
  if params.has_key?("type")
    puts "type: #{params["type"]}"
    #r = v.both_e.both_v(Conf.group_type, params["type"])
    r = v.both_e.both_v(type: params["type"])
    puts "count: #{r.count}"
    if r.count == 0
      nodes = []
      edges = []
    else
      sub = r.subgraph
    end 
  else
    sub = v.both_e.both_v.subgraph
  end
  if nodes != []
    nodes = sub.v.to_a.map{ |v| 
      Gr.dress(v)
    }
  end

  if edges != []
    edges = sub.e.to_a.map{|e| 
      {
        id: e.getId,
        label: e.label,
        source: e.in_v.first.getId, 
        target: e.out_v.first.getId
      }}
  end
  result = {nodes: nodes,edges: edges}
  content_type  :json
  #puts peers
  result.to_json
end


class Gr
  def self.dress(node)
    return {label: "ERROR"} if node == nil
    size = node[:all_degrees] || 1
    id = node.getId
    scaled_size = ((size * 20) * 0.1)+20
      {
      id: id,
      p: node.properties.merge({id: id}),
      size: size,
      scaled_size: scaled_size,
      label: "#{node[:name]} (#{size})",
      faveColor: '#6FB1FC'
      } 
  end
end
