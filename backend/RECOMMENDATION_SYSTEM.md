# Machine Learning Recommendation System

## Overview

The roommate listing platform now includes a sophisticated machine learning recommendation system that provides personalized listing suggestions based on user preferences and behavior.

## How It Works

### 1. Hybrid Recommendation Approach

The system uses a **hybrid approach** combining two main techniques:

- **Content-Based Filtering (60% weight)**: Analyzes listing features and matches them with user preferences
- **Collaborative Filtering (40% weight)**: Finds users with similar preferences and recommends listings they liked

### 2. Feature Extraction

The system extracts and analyzes the following listing features:

#### Basic Features
- Listing type (room vs entire property)
- Property type (apartment vs house)
- User role (owner vs tenant)

#### Numeric Features (normalized)
- Size (m²)
- Rent amount
- Number of bedrooms (single/double)
- Number of flatmates (male/female)
- Room size (for rooms)

#### Boolean Features
- Has bed included
- No deposit required
- Open-ended availability

#### Amenities & Rules
- Room amenities (furnished, private bathroom, balcony, etc.)
- Property amenities (WiFi, parking, heating, etc.)
- House rules (pet-friendly, smoker-friendly, etc.)

### 3. User Preference Learning

The system learns user preferences by:

1. **Analyzing liked listings**: When a user likes a listing, the system extracts all features from that listing
2. **Building preference vectors**: Creates a normalized preference vector based on the average features of all liked listings
3. **Real-time updates**: Updates preferences immediately when users like/unlike listings

### 4. Recommendation Scoring

Each listing gets a recommendation score calculated as:

```
Total Score = (Content Score × 0.6) + (Collaborative Score × 0.4)
```

#### Content Score Calculation
- **Cosine Similarity**: Measures how similar the listing features are to user preferences
- **Feature Matching**: Bonus points for specific features that match user preferences
- **Normalized scoring**: All scores are normalized to 0-100 range

#### Collaborative Score Calculation
- **Similar User Detection**: Finds users with >30% preference similarity
- **Like-based scoring**: Awards points based on how many similar users liked the listing
- **Similarity weighting**: Higher scores for users with higher similarity

### 5. Explanation System

The system provides **transparent explanations** for each recommendation:

- "Matches your preference for WiFi"
- "3 users with similar preferences liked this listing"
- "Similar to listings you've liked before"

## API Endpoints

### Get Recommendations
```
GET /api/recommendations?limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "recommendations": [
    {
      "listingId": 123,
      "score": 85.5,
      "reasons": [
        "Matches your preference for WiFi",
        "2 users with similar preferences liked this listing"
      ]
    }
  ],
  "count": 1
}
```

### Update User Preferences
```
POST /api/recommendations/update-preferences
Authorization: Bearer <token>
```

### Clear Cache
```
POST /api/recommendations/clear-cache
Authorization: Bearer <token>
```

## Performance Optimizations

### Caching Strategy
- **Listing features cache**: Caches extracted features for 5 minutes
- **User preferences cache**: Caches user preference vectors
- **Automatic invalidation**: Cache cleared when new likes are added

### Efficient Algorithms
- **Cosine similarity**: Fast vector similarity calculation
- **Lazy loading**: Features extracted only when needed
- **Batch processing**: Multiple listings processed efficiently

## Machine Learning Libraries Used

- **ml-matrix**: Matrix operations for similarity calculations
- **ml-cart**: Decision tree algorithms (for future enhancements)
- **ml-regression**: Regression models (for future enhancements)

## Future Enhancements

### Planned Features
1. **Deep Learning Integration**: Neural networks for better feature learning
2. **Time-based Decay**: Recent likes weighted more heavily
3. **Location-based Filtering**: Geographic preferences
4. **Price Sensitivity**: Learning user budget preferences
5. **Seasonal Patterns**: Understanding seasonal housing preferences

### Advanced Algorithms
1. **Matrix Factorization**: For better collaborative filtering
2. **Neural Collaborative Filtering**: Deep learning for user-item interactions
3. **Multi-armed Bandit**: A/B testing for recommendation optimization

## Usage Examples

### Frontend Integration
```typescript
import { useRecommendations } from '../hooks/useRecommendations';

const MyComponent = () => {
  const { recommendations, loading, error } = useRecommendations(10);
  
  return (
    <div>
      {recommendations.map(rec => (
        <div key={rec.listingId}>
          <h3>Match Score: {Math.round(rec.score)}%</h3>
          <ul>
            {rec.reasons.map(reason => <li>{reason}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};
```

### Backend Integration
```typescript
import { RecommendationService } from '../services/recommendationService';

const recommendationService = new RecommendationService();
const recommendations = await recommendationService.getRecommendations(userId, 20);
```

## Monitoring & Analytics

The system includes comprehensive logging for:
- Recommendation generation times
- User interaction patterns
- Feature extraction performance
- Cache hit/miss rates

## Security Considerations

- **Authentication required**: All recommendation endpoints require valid JWT tokens
- **User isolation**: Users can only access their own recommendations
- **Data privacy**: No user data shared between users in collaborative filtering
- **Rate limiting**: API endpoints include rate limiting to prevent abuse

## Testing

The recommendation system includes:
- Unit tests for feature extraction
- Integration tests for API endpoints
- Performance benchmarks
- A/B testing framework for algorithm comparison

## Deployment Notes

1. **Dependencies**: Ensure all ML libraries are installed
2. **Memory**: Recommendation service requires additional memory for caching
3. **CPU**: Feature extraction can be CPU-intensive for large datasets
4. **Database**: Ensure proper indexing on likes and listings tables 