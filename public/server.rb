require 'sinatra'

set :static true
set :root '/'

get '/' do
  send_file 'index.html'
end
