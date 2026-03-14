FactoryBot.define do
  factory :availability do
    volunteer
    day_of_week { %w[Monday Tuesday Wednesday Thursday Friday Saturday Sunday].sample }
    time_of_day { %w[Morning Afternoon Evening].sample }
  end
end
