# YelpMatch

A collaborative dining decision app that makes choosing a restaurant fun and easy. Inspired by Tinder's swipe interface, YelpMatch allows groups to vote on restaurants and find the perfect match.

## ✨ Feature Highlights

- **Group Matching**: Create a session and invite friends to join.
- **Real-time Updates**: Watch as friends join the session and see who's ready.
- **Swipe Interface**: Swipe right to like, left to pass. It's that simple!
- **"It's a Match!"**: Instant notification when everyone in the group likes the same restaurant.
- **Yelp AI Integration**: Powered by Yelp's AI API for personalized restaurant recommendations based on your group's preferences.
- **Smart Filters**: Filter by cuisine, location, price range, rating, date, and time.
- **Dynamic Status**: Real-time feedback on session status ("Waiting for friends...", "Loading Restaurants...", "Session Ready!").
- **Responsive Design**: Optimized for mobile devices with a native app-like feel.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Yelp Fusion API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Yelpgroupmatch.git
   cd Yelpgroupmatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Yelp API key:
   ```env
   VITE_YELP_API_KEY=your_yelp_api_key_here
   ```
   > **Note**: You need a Yelp Fusion API key to fetch real restaurant data. Without it, the app may not function correctly or will use mock data if implemented.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   Navigate to `http://localhost:5173` to start matching!

## 🛠️ Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: Yelp Fusion AI API

## 📱 Usage

1. **Select Preferences**: Choose your desired cuisine, location, price, and time.
2. **Share the Link**: Send the unique session link to your friends.
3. **Wait for Friends**: Hang out in the waiting room until everyone joins.
4. **Start Swiping**: Swipe through curated restaurant cards.
5. **Match & Eat**: Get notified instantly when a match is found!

---

*Built for the Yelp AI API Hackathon*