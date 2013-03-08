require 'sinatra'

set :static, true
set :public_folder, Proc.new { File.join root, 'public' }

get '/' do
  send_file File.expand_path 'index.html', settings.public_folder
end
