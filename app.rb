require 'sinatra'
require 'sinatra/content_for'
require 'rack/ssl'

require 'breezy_pdf'

# Configure Breezy PDF
BreezyPDF.setup do |config|
  # Obtain your very own API key from https://breezypdf.com
  config.secret_api_key             = ENV['BREEZY_PDF_SECRET_API_KEY']

  # See the breezy_pdf gem's documentation for configuration information
  # https://github.com/danielwestendorf/breezy_pdf-ruby#configuration
  config.middleware_path_matchers   = [/locations\.pdf/, /survey-results\.pdf/, /dashboard\.pdf/]
  config.treat_urls_as_private      = true
  config.upload_assets              = true
  config.extract_metadata           = true
  config.threads                    = Concurrent.processor_count
  config.filter_elements            = true
  config.filter_elements_selectors  = %w[.breezy-pdf-remove]
  config.logger.level               = Logger::INFO

  config.asset_cache                = BreezyPDF::Cache::InMemory.new if ENV['RACK_ENV'] == 'production'
end

use BreezyPDF::Middleware
set :public_folder, File.dirname(__FILE__) + '/public'
use Rack::Session::Cookie, key:          'session',
                           domain:       ENV.fetch("HOST", "localhost"),
                           path:         '/',
                           expire_after:  2592000, # In seconds
                           secret:       ENV.fetch("SECRET", "123456")

helpers Sinatra::ContentFor

use Rack::SSL if ENV['RACK_ENV'] == 'production'

get '/' do
  erb :dashboard, layout: :reports
end

get '/dashboard' do
  erb :dashboard, layout: :reports
end

get '/locations' do
  session[:locations] ||= [
    { latitude: "40.7127753", longitude: "-74.0059728", location_name: "New York" },
    { latitude: "34.0522342", longitude: "-118.2436849", location_name: "Los Angeles" },
  ]
  erb :locations
end

post '/locations' do
  session[:locations].push({
    latitude: params["latitude"], longitude: params["longitude"], location_name: params["location_name"]
  })

  redirect "/"
end

delete '/locations/:index' do
  i = params[:index].to_i
  session[:locations].delete_at(i) if session[:locations][i]

  redirect "/"
end

get "/survey-results" do
  erb :survey_results
end
