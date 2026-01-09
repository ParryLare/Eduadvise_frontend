import { Link } from "react-router-dom";
import { Star, MapPin, Languages, Clock, ChevronRight, Heart } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const CounselorCard = ({ counselor, onSave, isSaved }) => {
  const user = counselor.user || {};
  const minPrice = counselor.services?.length > 0 
    ? Math.min(...counselor.services.map(s => s.price)) 
    : 0;

  return (
    <div 
      className="group bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      data-testid={`counselor-card-${counselor.counselor_id}`}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-teal-100 to-sand-100">
        {counselor.photo ? (
          <img 
            src={counselor.photo} 
            alt={`${user.first_name} ${user.last_name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 bg-teal-700 rounded-full flex items-center justify-center text-white text-3xl font-heading font-bold">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
          </div>
        )}
        
        {/* Save Button */}
        {onSave && (
          <button 
            onClick={(e) => { e.preventDefault(); onSave(counselor.counselor_id); }}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isSaved ? 'bg-coral-400 text-white' : 'bg-white/90 text-gray-600 hover:bg-coral-400 hover:text-white'}`}
            data-testid={`save-counselor-${counselor.counselor_id}`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-sm">{counselor.rating?.toFixed(1) || '0.0'}</span>
          <span className="text-muted-foreground text-sm">({counselor.total_reviews || 0})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-foreground mb-1">
          {user.first_name} {user.last_name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{counselor.credentials}</p>

        {/* Experience & Languages */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {counselor.experience_years} years
          </span>
          <span className="flex items-center gap-1">
            <Languages className="w-4 h-4" />
            {counselor.languages?.slice(0, 2).join(', ')}
          </span>
        </div>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 mb-4">
          {counselor.specializations?.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-teal-50 text-teal-700 border-0">
              {spec}
            </Badge>
          ))}
          {counselor.specializations?.length > 3 && (
            <Badge variant="secondary" className="bg-muted">
              +{counselor.specializations.length - 3}
            </Badge>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-sm text-muted-foreground">From</span>
            <p className="font-heading font-bold text-xl text-teal-700">${minPrice}</p>
          </div>
          <Link to={`/counselors/${counselor.counselor_id}`}>
            <Button className="btn-primary py-2 px-4" data-testid={`view-profile-${counselor.counselor_id}`}>
              View Profile
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CounselorCard;
