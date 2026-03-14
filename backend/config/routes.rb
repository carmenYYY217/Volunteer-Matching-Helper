Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Routes for the React Intake Form
      namespace :public do
        resources :skills, only: [:index]
        resources :availabilities, only: [:index]
        resources :volunteers, only: [:create]
      end
      
      # Routes for the React Admin Dashboard
      namespace :admin do
        resources :volunteers, only: [:index, :show, :update, :destroy]
      end
    end
  end
end
