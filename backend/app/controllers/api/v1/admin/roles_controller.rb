module Api
  module V1
    module Admin
      class RolesController < BaseController
        before_action :set_role, only: [:show, :update, :destroy, :ai_match]

        def index
          roles = Role.all
          render json: roles.as_json(include: :skills)
        end

        def show
          render json: @role.as_json(include: :skills)
        end

        def create
          role = Role.new(role_params)
          if role.save
            render json: role, status: :created
          else
            render json: { errors: role.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          if @role.update(role_params)
            render json: @role
          else
            render json: { errors: @role.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def destroy
          @role.destroy
          head :no_content
        end

        def ai_match
          # Stubbed endpoint for AI match
          matching_volunteers = VolunteerMatcherService.new(@role).call
          
          # Generate a sample AI draft for the top matched volunteer (if any)
          sample_draft = if matching_volunteers.any?
                           AiDraftingService.new(@role, matching_volunteers.first).call
                         else
                           "No volunteers matched yet."
                         end

          render json: {
            role: @role.as_json(include: :skills),
            matched_volunteers: matching_volunteers.as_json(include: [:skills, :availabilities]),
            sample_ai_draft: sample_draft,
            message: "AI matching will be integrated here. Currently showing skill-based matches."
          }
        end

        private

        def set_role
          @role = Role.find(params[:id])
        end

        def role_params
          params.require(:role).permit(:title, :description, :event_date, :status, skill_ids: [])
        end
      end
    end
  end
end
