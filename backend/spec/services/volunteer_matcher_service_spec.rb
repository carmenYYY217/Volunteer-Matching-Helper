require 'rails_helper'

RSpec.describe VolunteerMatcherService, type: :service do
  let(:skill1) { create(:skill, name: 'Photography') }
  let(:skill2) { create(:skill, name: 'Driving') }
  let(:skill3) { create(:skill, name: 'Data Entry') }
  
  let(:role) { create(:role) }

  before do
    role.skills << [skill1, skill2]
  end

  describe '#call' do
    it 'successfully returns a volunteer who has an exact skill match' do
      volunteer = create(:volunteer)
      volunteer.skills << skill1

      service = VolunteerMatcherService.new(role)
      matched_volunteers = service.call

      expect(matched_volunteers).to include(volunteer)
      expect(matched_volunteers.length).to eq(1)
    end

    it 'correctly orders multiple volunteers based on who has the highest number of matching skills' do
      # Volunteer A has 2 matching skills
      volunteer_a = create(:volunteer)
      volunteer_a.skills << [skill1, skill2]

      # Volunteer B has 1 matching skill
      volunteer_b = create(:volunteer)
      volunteer_b.skills << skill2

      # Volunteer C has 1 matching skill and 1 non-matching skill
      volunteer_c = create(:volunteer)
      volunteer_c.skills << [skill1, skill3]

      service = VolunteerMatcherService.new(role)
      matched_volunteers = service.call

      expect(matched_volunteers.length).to eq(3)
      # Volunteer A should be first because they have 2 matching skills
      expect(matched_volunteers.first).to eq(volunteer_a)
      # Volunteer B and C both have 1 matching skill, so they should follow
      expect(matched_volunteers[1..2]).to include(volunteer_b, volunteer_c)
    end

    it 'returns an empty array if no volunteers match the role required skills' do
      volunteer = create(:volunteer)
      volunteer.skills << skill3 # Non-matching skill

      service = VolunteerMatcherService.new(role)
      matched_volunteers = service.call

      expect(matched_volunteers).to be_empty
    end
  end
end
