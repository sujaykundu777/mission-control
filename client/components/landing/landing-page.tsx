'use client'

import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { VideoModal } from '@/components/video-modal'
import Link from 'next/link'
import { ArrowRight, Lock, Zap, Brain, Users, Bell, Workflow, RocketIcon } from 'lucide-react'
import { useState } from 'react'

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollBehavior: 'smooth' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-md bg-background/80 border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              {/* <Users className="w-5 h-5 text-primary" /> */}
                <RocketIcon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">ContactOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition cursor-pointer">Features</button>
            <button onClick={() => scrollToSection('capabilities')} className="text-muted-foreground hover:text-foreground transition cursor-pointer">Capabilities</button>
            <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition cursor-pointer">Pricing</button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link href="/auth/login"><Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button></Link>
          </div>
        </div>
        
        {/* Aurora Glow Effect */}
        <div className="absolute top-full left-0 right-0 h-40 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-r from-transparent via-primary/40 to-transparent blur-3xl opacity-50"></div>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-3/4 h-full bg-gradient-to-r from-transparent via-primary/30 to-transparent blur-3xl opacity-40"></div>
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-1/2 h-full bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-2xl opacity-30"></div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/30 bg-primary/5">
            <span className="text-sm text-primary font-medium">Privacy-First Contacts Management</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Your Contacts, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Supercharged</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The powerful, AI-driven contact management platform built for modern professionals. Offline-first, lightning-fast, and completely private.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 h-12 px-8" onClick={() => setIsVideoOpen(true)}>
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-card border border-primary/20 rounded-2xl p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold">Smart Organization</span>
                </div>
                <p className="text-sm text-muted-foreground ml-13">Relationship trees and intelligent grouping</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold">AI-Powered</span>
                </div>
                <p className="text-sm text-muted-foreground ml-13">Intelligent insights and automation</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold">Completely Private</span>
                </div>
                <p className="text-sm text-muted-foreground ml-13">Your data stays with you</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to manage relationships, automate workflows, and never miss important moments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">Offline-first architecture means instant access to your contacts, even without internet. Zero lag, zero delays.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Privacy First</h3>
              <p className="text-muted-foreground">End-to-end encrypted. Your contact data is encrypted locally and never exposed to external servers.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
              <p className="text-muted-foreground">Get intelligent suggestions for relationship management and contact organization using advanced AI.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Relationship Trees</h3>
              <p className="text-muted-foreground">Visualize and manage complex contact relationships. See how your network is connected at a glance.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Reminders</h3>
              <p className="text-muted-foreground">Never miss a birthday, anniversary, or important date. AI-powered greeting suggestions included.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background border border-primary/20 rounded-xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Workflow Automation</h3>
              <p className="text-muted-foreground">Create powerful automations to manage follow-ups, categorize contacts, and streamline your process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From personal contacts to complex business relationships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">For Individuals</h3>
              <ul className="space-y-4">
                {['Personal contact management', 'Birthday & anniversary tracking', 'Relationship notes and history', 'Cross-device synchronization', 'Secure offline access'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-primary font-semibold">✓</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">For Professionals</h3>
              <ul className="space-y-4">
                {['Advanced relationship mapping', 'Business contact organization', 'Custom workflows & automations', 'Team collaboration features', 'Integration with your tools'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-primary font-semibold">✓</span>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold">Works Everywhere</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Seamlessly sync across all your devices</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['iPhone', 'Android', 'Mac', 'Windows', 'Web', 'iPad', 'Linux', 'Watch'].map((platform) => (
              <div key={platform} className="bg-background border border-primary/20 rounded-lg py-4 px-6 hover:border-primary/40 transition-colors">
                <p className="font-medium">{platform}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Choose the plan that fits your needs. Scale up anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-background border border-primary/20 rounded-xl p-8 space-y-6 hover:border-primary/40 transition-colors flex flex-col">
              <div>
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold">$9<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">Up to 10 contacts</p>
              </div>

              <ul className="space-y-3 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">10 contacts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Offline access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Basic reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Cross-device sync</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground font-bold">✗</span>
                  </div>
                  <span className="text-sm text-muted-foreground">AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-muted-foreground font-bold">✗</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Workflow automation</span>
                </li>
              </ul>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </div>

            {/* Professional Plan */}
            <div className="bg-background border border-primary/50 rounded-xl p-8 space-y-6 hover:border-primary/70 transition-colors flex flex-col ring-1 ring-primary/20">
              {/* <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
              </div> */}
              
              <div className="pt-2">
                <h3 className="text-2xl font-bold mb-2">Professional</h3>
                <p className="text-muted-foreground">For serious users</p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">Up to 100 contacts</p>
              </div>

              <ul className="space-y-3 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">100 contacts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Offline access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Smart reminders with AI</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Cross-device sync</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">AI insights & suggestions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Basic workflow automation</span>
                </li>
              </ul>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-background border border-primary/20 rounded-xl p-8 space-y-6 hover:border-primary/40 transition-colors flex flex-col">
              <div>
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-muted-foreground">For power users</p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground">Up to 1000 contacts</p>
              </div>

              <ul className="space-y-3 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">1000 contacts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Offline access</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Advanced AI reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Cross-device sync</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-primary font-bold">✓</span>
                  </div>
                  <span className="text-sm">Full workflow automation</span>
                </li>
              </ul>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-sm mt-12">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-2xl p-12 text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold">Ready to Transform Your Contacts?</h2>
            <p className="text-lg text-muted-foreground">Join thousands of professionals and individuals who trust ContactOS with their most important relationships.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12 px-8">
                Start Your Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 h-12 px-8">
                Schedule Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">No credit card required. Full features for 14 days.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold">ContactOS</span>
              </div>
              <p className="text-sm text-muted-foreground">Privacy-first contact management for the modern era.</p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#security" className="hover:text-foreground transition">Open Source</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition">Blog</Link></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-foreground transition">Terms and Conditions</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2024 ContactOS. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">LinkedIn</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </div>
  )
}