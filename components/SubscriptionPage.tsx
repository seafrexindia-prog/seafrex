
import React, { useState, useEffect } from 'react';
import { Check, Shield, Globe, Users, ArrowRight, X, Zap } from 'lucide-react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

interface SubscriptionPageProps {
  userEmail: string;
  onSuccess: () => void;
  onLogout?: () => void;
  onCancel?: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ userEmail, onSuccess, onLogout, onCancel }) => {
  const [prices, setPrices] = useState<Record<string, number>>({ FREE: 0, OFFICE: 1999, CORPORATE: 9999 });

  useEffect(() => {
    setPrices(adminService.getPlanPricing());
  }, []);
  
  const handlePurchase = (plan: 'FREE' | 'OFFICE' | 'CORPORATE') => {
      // Mock Payment Process
      if (window.confirm(`You are about to be redirected to the payment gateway for the ${plan} plan (₹${prices[plan]}).\n\nClick OK to simulate successful payment.`)) {
          authService.updateSubscription(userEmail, plan, 365); // Add 365 days for yearly plans
          alert("Payment Successful! Subscription Activated.");
          onSuccess();
      }
  };

  const PlanCard = ({ title, price, features, color, popular, subText }: any) => (
    <div className={`relative bg-white/5 border ${popular ? 'border-emerald-500' : 'border-white/10'} rounded-2xl p-8 flex flex-col hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2`}>
       {popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg">MOST POPULAR</div>}
       <h3 className={`text-xl font-bold ${color} mb-2`}>{title}</h3>
       <div className="mb-1">
          <span className="text-4xl font-bold text-white">₹{price}</span>
          <span className="text-ocean-400">/year</span>
       </div>
       <div className="text-xs text-ocean-400 mb-6">{subText}</div>
       
       <div className="flex-1">
         <p className="text-xs font-bold text-ocean-500 uppercase mb-3 tracking-wider">Features</p>
         <ul className="space-y-3 mb-8">
            {features.map((feat: string, idx: number) => (
               <li key={idx} className="flex items-start text-ocean-200 text-sm">
                  <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" /> {feat}
               </li>
            ))}
         </ul>
       </div>
       <button onClick={() => handlePurchase(title === 'Free Trial' ? 'FREE' : title === 'Office Plan' ? 'OFFICE' : 'CORPORATE')} className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg ${popular ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500' : 'bg-ocean-700 hover:bg-ocean-600'}`}>
          {price === 0 ? 'Current Plan' : 'Subscribe Now'}
       </button>
    </div>
  );

  const basicFeatures = [
      'Auto Emailing & Notifications',
      'WhatsApp Integration',
      'Global Network Access'
  ];

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col items-center justify-center p-6 relative overflow-hidden custom-scrollbar">
       {/* Background Effects */}
       <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none" />
       
       {onCancel && (
         <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-ocean-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-50">
           <X className="w-6 h-6" />
         </button>
       )}

       <div className="text-center max-w-2xl mb-12 relative z-10 animate-fade-in-up">
          <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-ocean-200 text-lg">Unlock the full power of Seafrex. Scale your logistics operations with our premium features.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full relative z-10 animate-fade-in-up">
          <PlanCard 
             title="Free Trial" 
             price={prices['FREE']} 
             color="text-ocean-300"
             subText="For starters"
             features={[
                 '5 Offers per day',
                 '5 Inquiries per day',
                 'Create 1 Sub-User',
                 'Unlimited Explore Market',
                 ...basicFeatures
             ]}
          />
          <PlanCard 
             title="Office Plan" 
             price={prices['OFFICE']} 
             color="text-emerald-400"
             popular={true}
             subText="For growing teams"
             features={[
                 'Unlimited Offers & Inquiries',
                 'Create 5 Sub-Users',
                 'Unlimited Explore Market',
                 ...basicFeatures
             ]}
          />
          <PlanCard 
             title="Corporate" 
             price={prices['CORPORATE']} 
             color="text-indigo-400"
             subText="For large organizations"
             features={[
                 'Unlimited Offers & Inquiries',
                 'Create 25 Sub-Users',
                 'Unlimited Explore Market',
                 ...basicFeatures
             ]}
          />
       </div>

       {onLogout && (
         <div className="mt-12 text-center">
            <button onClick={onLogout} className="text-ocean-400 hover:text-white flex items-center mx-auto transition-colors">
               Log out and return to home <ArrowRight className="w-4 h-4 ml-2" />
            </button>
         </div>
       )}
    </div>
  );
};
